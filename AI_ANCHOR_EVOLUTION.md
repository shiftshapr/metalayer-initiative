# AI Anchor Evolution: Complex Shapes and Object Detection

This document outlines the evolution path for AI-powered content anchoring, enabling complex shape selection and object detection in images and videos.

## Current State

**Phase 0 (Current)**: Manual selection
- Text: Full sentence selection with context
- Image: Rectangle selection (start + optional end coordinates)
- Video: Timestamp range + optional rectangle selection
- Audio: Timestamp range

**Limitations**:
- Manual user selection only
- Simple geometric shapes (rectangles)
- No object recognition
- No semantic understanding

## Evolution Phases

### Phase 1: Enhanced Manual Selection (Near-term: 3-6 months)

**Goal**: Improve manual selection tools

**Features**:
- Polygon selection tool for images
- Freehand drawing for irregular shapes
- Circle/ellipse selection
- Multi-point selection paths

**Technical Requirements**:
- Canvas-based selection UI
- Coordinate system for complex shapes
- SVG path generation
- Storage format for polygon coordinates

**Feasibility**: ✅ **High**
- Pure frontend implementation
- No AI/ML required
- Can use existing canvas libraries (Fabric.js, Konva.js)

**Implementation**:
```typescript
interface ComplexShapeAnchor {
  type: 'polygon' | 'circle' | 'freehand';
  coordinates: Array<{ x: number; y: number }>;
  coordinateSystem: 'percentage' | 'pixels';
}
```

---

### Phase 2: AI-Assisted Selection (Medium-term: 6-12 months)

**Goal**: AI helps refine manual selections

**Features**:
- Smart edge detection for manual selections
- Auto-complete selection boundaries
- Suggest optimal selection areas
- Snap to detected objects

**Technical Requirements**:
- Client-side ML model (TensorFlow.js, ONNX.js)
- Lightweight object detection model
- Edge detection algorithms
- Real-time inference (< 100ms)

**Feasibility**: ✅ **Medium-High**
- Client-side models are feasible
- TensorFlow.js provides good performance
- Models can be pre-loaded or lazy-loaded
- May require model optimization for browser

**AI Models**:
- **Edge Detection**: Canny edge detector (classical CV)
- **Object Detection**: MobileNet-SSD or YOLOv5-nano (lightweight)
- **Semantic Segmentation**: DeepLabV3+ Mobile (for region suggestions)

**Implementation**:
```typescript
interface AIAssistedAnchor {
  manualSelection: ComplexShapeAnchor;
  aiRefinement?: {
    method: 'edge-detection' | 'object-snap' | 'boundary-completion';
    confidence: number;
    suggestedBoundary?: Array<{ x: number; y: number }>;
  };
}
```

---

### Phase 3: Object Detection Anchoring (Medium-term: 9-15 months)

**Goal**: Detect and anchor to specific objects in images/videos

**Features**:
- Click on object → AI detects and selects it
- Automatic bounding box generation
- Object classification (person, car, building, etc.)
- Multi-object selection

**Technical Requirements**:
- Object detection model (YOLO, Faster R-CNN, or similar)
- Real-time inference capability
- Object tracking for video
- Confidence scoring

**Feasibility**: ⚠️ **Medium**
- Requires more powerful models
- May need server-side processing for accuracy
- Client-side possible but with trade-offs
- Video tracking adds complexity

**AI Models**:
- **Images**: YOLOv8 or EfficientDet (good speed/accuracy balance)
- **Videos**: YOLOv8 + ByteTrack (object tracking)
- **Classification**: ResNet or EfficientNet (for object categories)

**Hybrid Approach**:
1. **Client-side**: Quick detection with lightweight model
2. **Server-side**: Refined detection with powerful model (optional)
3. **Caching**: Store detection results for repeated anchors

**Implementation**:
```typescript
interface ObjectAnchor {
  objectClass: string; // 'person', 'car', 'building', etc.
  confidence: number; // 0-1
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  model: string; // 'yolo-v8', 'efficientdet', etc.
  modelVersion: string;
  // For video: tracking ID
  trackingId?: string;
}
```

---

### Phase 4: Semantic Segmentation (Long-term: 12-18 months)

**Goal**: Anchor to semantic regions, not just objects

**Features**:
- Select semantic regions (sky, road, person, etc.)
- Multi-class segmentation
- Precise boundary detection
- Context-aware selection

**Technical Requirements**:
- Semantic segmentation model (DeepLabV3+, SegFormer)
- Higher computational requirements
- May require server-side processing
- Real-time or near-real-time inference

**Feasibility**: ⚠️ **Medium-Low**
- More computationally intensive
- Likely requires server-side processing
- Client-side possible with optimization
- May need WebGPU acceleration

**AI Models**:
- **Images**: DeepLabV3+ or SegFormer-B0 (lightweight)
- **Videos**: Temporal consistency models
- **Real-time**: MobileNet-based segmentation

**Implementation**:
```typescript
interface SemanticAnchor {
  semanticClass: string; // 'person', 'sky', 'road', etc.
  mask: {
    type: 'bitmap' | 'polygon';
    data: string | Array<{ x: number; y: number }>;
  };
  confidence: number;
  model: string;
}
```

---

### Phase 5: Advanced AI Features (Long-term: 18-24 months)

**Goal**: Advanced AI-powered anchoring capabilities

**Features**:
- Natural language queries ("anchor to the person on the left")
- Automatic scene understanding
- Relationship detection (person near car)
- Temporal object tracking across video frames
- Style/emotion detection

**Technical Requirements**:
- Multi-modal AI (vision + language)
- Large language models (GPT-4 Vision, CLIP)
- Scene graph generation
- Advanced tracking algorithms
- Server-side processing likely required

**Feasibility**: ❌ **Low (Current)**, ✅ **Medium (Future)**
- Requires significant infrastructure
- Large model deployment
- High computational costs
- May become more feasible as models improve

**AI Models**:
- **Vision-Language**: CLIP, BLIP-2, GPT-4 Vision
- **Scene Understanding**: Scene Graph Generation models
- **Tracking**: DeepSORT, FairMOT

**Implementation**:
```typescript
interface AdvancedAIAnchor {
  query?: string; // Natural language query
  detectedObjects: Array<{
    class: string;
    confidence: number;
    relationships?: Array<{
      target: string;
      relation: string; // 'near', 'above', 'interacting with'
    }>;
  }>;
  sceneGraph?: SceneGraph;
  temporalTracking?: Array<{
    frame: number;
    objectId: string;
    position: { x: number; y: number };
  }>;
}
```

---

## Technical Architecture Evolution

### Phase 1-2: Client-Side Only
```
Browser
  └─ Content Script
      └─ Selection UI
      └─ Canvas/Shape Tools
      └─ TensorFlow.js Model (Phase 2)
          └─ Object Detection
```

### Phase 3-4: Hybrid Client/Server
```
Browser                    Server
  └─ Content Script          └─ AI Service
      └─ Quick Detection          └─ Heavy Models
      └─ UI                          └─ Refined Detection
      └─ Caching                     └─ Model Management
```

### Phase 5: Server-Heavy
```
Browser                    Server
  └─ Content Script          └─ AI Service
      └─ UI                      └─ Multi-Modal Models
      └─ Query Interface          └─ LLM Integration
                                      └─ Scene Understanding
```

## When Will This Be Feasible?

### Immediate (0-3 months)
- ✅ Enhanced manual selection (polygon, freehand)
- ✅ Basic coordinate storage

### Near-term (3-6 months)
- ✅ Client-side edge detection
- ✅ Lightweight object detection (with optimization)
- ⚠️ May require model size optimization

### Medium-term (6-12 months)
- ✅ Object detection anchoring
- ✅ Video object tracking
- ⚠️ May need server-side for accuracy
- ✅ Hybrid approach (client quick + server refined)

### Long-term (12-24 months)
- ⚠️ Semantic segmentation (depends on model optimization)
- ⚠️ Natural language queries (depends on infrastructure)
- ✅ As models improve, more features become feasible

## Key Factors Affecting Feasibility

### 1. Model Size & Performance
- **Current**: Models are getting smaller and faster
- **Trend**: Mobile-optimized models (MobileNet, EfficientNet)
- **Future**: WebGPU acceleration will help significantly

### 2. Browser Capabilities
- **Current**: WebAssembly, Web Workers, WebGL
- **Future**: WebGPU (better GPU access), WebNN (neural network API)

### 3. Infrastructure Costs
- **Client-side**: Free but limited by device
- **Server-side**: Costs scale with usage
- **Hybrid**: Balance cost and performance

### 4. User Experience
- **Latency**: Must be < 500ms for good UX
- **Accuracy**: Must be > 80% confidence for useful
- **Battery**: Client-side processing drains battery

## Recommended Evolution Path

### Year 1 (2025)
1. **Q1-Q2**: Enhanced manual selection (Phase 1)
2. **Q3-Q4**: AI-assisted selection (Phase 2)

### Year 2 (2026)
3. **Q1-Q2**: Object detection anchoring (Phase 3)
4. **Q3-Q4**: Semantic segmentation (Phase 4)

### Year 3+ (2027+)
5. **As infrastructure allows**: Advanced AI features (Phase 5)

## Implementation Strategy

### Start Simple
- Begin with enhanced manual tools
- No AI required initially
- Build infrastructure for future AI

### Incremental AI
- Add AI features gradually
- Start client-side, move to hybrid
- Optimize models for browser

### User Choice
- Allow users to opt-in to AI features
- Provide manual fallback always
- Progressive enhancement approach

### Data Collection
- Collect anonymized usage data
- Improve models based on real usage
- A/B test AI features

## Current Type System Support

The current `ObjectAnchor` interface in `src/types/anchors.ts` is designed to support future evolution:

```typescript
interface ObjectAnchor {
  confidence: number;
  objectClass?: string;
  shape: {
    type: 'rectangle' | 'polygon' | 'circle';
    coordinates: Array<{ x: number; y: number }>;
  };
  model?: string;
  modelVersion?: string;
}
```

This structure can evolve to support:
- Phase 1: Manual complex shapes
- Phase 2: AI-refined shapes
- Phase 3: Object detection
- Phase 4: Semantic regions
- Phase 5: Advanced features

## Conclusion

**Feasibility Timeline**:
- **Phase 1 (Manual)**: ✅ Now
- **Phase 2 (AI-Assisted)**: ✅ 6-12 months
- **Phase 3 (Object Detection)**: ⚠️ 9-15 months (hybrid approach)
- **Phase 4 (Semantic)**: ⚠️ 12-18 months (server-side likely)
- **Phase 5 (Advanced)**: ❓ 18-24+ months (infrastructure dependent)

**Recommendation**: Start with Phase 1 (enhanced manual selection) while building infrastructure for AI features. This provides immediate value while preparing for future AI capabilities.









