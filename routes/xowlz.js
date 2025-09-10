const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Configuration
const TOTAL_NFTS = 589;
const IMAGES_DIR = '/home/ubuntu/xowlz/public/images';
const METADATA_PATH = path.join(IMAGES_DIR, 'generation-metadata.json');

function loadGenerationMetadata() {
  if (!fs.existsSync(METADATA_PATH)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(METADATA_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to read generation metadata:', error);
    return null;
  }
}

// Health for this module
router.get('/health', (req, res) => {
  res.json({ status: 'healthy', ts: new Date().toISOString() });
});

// Status endpoint (optional but helpful)
router.get('/api/status', (req, res) => {
  const meta = loadGenerationMetadata();
  if (!meta) {
    return res.json({ status: 'not_generated', total: TOTAL_NFTS, generated: 0 });
  }
  res.json({
    status: 'ready',
    total: TOTAL_NFTS,
    generated: meta.totalGenerated ?? (Array.isArray(meta.files) ? meta.files.length : 0),
    generatedAt: meta.timestamp ? new Date(meta.timestamp).toISOString() : null
  });
});

// Serve NFT image by number
router.get('/api/nft/:number', (req, res) => {
  const nftNumber = parseInt(req.params.number, 10);
  if (Number.isNaN(nftNumber) || nftNumber < 1 || nftNumber > TOTAL_NFTS) {
    return res.status(400).json({ error: 'Invalid NFT number. Must be between 1 and 589.' });
  }

  const meta = loadGenerationMetadata();
  if (!meta || !Array.isArray(meta.files)) {
    return res.status(404).json({ error: 'No images generated yet. Run the generation script first.' });
  }

  const fileInfo = meta.files.find(f => f.nftNumber === nftNumber);
  if (!fileInfo) {
    return res.status(404).json({ error: `Image for NFT #${nftNumber} not found.` });
  }

  const imagePath = path.join(IMAGES_DIR, fileInfo.filename);
  if (!fs.existsSync(imagePath)) {
    return res.status(404).json({ error: `Image file for NFT #${nftNumber} not found on disk.` });
  }

  res.setHeader('Cache-Control', 'public, max-age=300');
  return res.sendFile(path.resolve(imagePath));
});

// Serve NFT metadata by number
router.get('/api/nft/:number/metadata', (req, res) => {
  const nftNumber = parseInt(req.params.number, 10);
  if (Number.isNaN(nftNumber) || nftNumber < 1 || nftNumber > TOTAL_NFTS) {
    return res.status(400).json({ error: 'Invalid NFT number. Must be between 1 and 589.' });
  }

  const meta = loadGenerationMetadata();
  if (!meta || !Array.isArray(meta.files)) {
    return res.status(404).json({ error: 'No images generated yet. Run the generation script first.' });
  }

  const fileInfo = meta.files.find(f => f.nftNumber === nftNumber);
  if (!fileInfo) {
    return res.status(404).json({ error: `Metadata for NFT #${nftNumber} not found.` });
  }

  const baseUrl = process.env.BASE_PUBLIC_URL || 'https://nft.xowlz.com';
  res.json({
    nftNumber: fileInfo.nftNumber,
    imageUrl: `${baseUrl}/api/nft/${fileInfo.nftNumber}`,
    filename: fileInfo.filename,
    generatedAt: meta.timestamp ? new Date(meta.timestamp).toISOString() : null
  });
});

// List all available NFTs
router.get('/api/nfts', (req, res) => {
  const meta = loadGenerationMetadata();
  if (!meta || !Array.isArray(meta.files)) {
    return res.status(404).json({ error: 'No images generated yet. Run the generation script first.' });
  }
  const baseUrl = process.env.BASE_PUBLIC_URL || 'https://nft.xowlz.com';
  const nfts = meta.files.map(file => ({
    nftNumber: file.nftNumber,
    imageUrl: `${baseUrl}/api/nft/${file.nftNumber}`,
    filename: file.filename
  }));
  res.json({ total: nfts.length, nfts });
});

module.exports = router;


