const express = require('express');
const router = express.Router();
const provenanceController = require('../controllers/provenanceController');

// GET /.well-known/provenance for a message
// This matches: /message/:messageId/.well-known/provenance
router.get('/message/:messageId/.well-known/provenance', provenanceController.getProvenance);

// POST to store provenance artifact (for future use)
router.post('/message/:messageId/provenance', provenanceController.storeProvenance);

// GET all provenance artifacts for a message (alternative endpoint)
router.get('/message/:messageId/provenance', provenanceController.getProvenance);

module.exports = router;













