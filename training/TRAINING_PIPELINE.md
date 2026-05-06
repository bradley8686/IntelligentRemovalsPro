# Training Pipeline

This is the workflow to build the real removals-specific AI model.

## 1. Collect Photos

Open the phone app:

```text
https://bradley8686.github.io/IntelligentRemovalsPro/web/mobile.html
```

Use **Training Capture**.

Minimum target:

- 100 photos per label for a rough first model.
- 300-500 photos per label for a commercial model.

Start with fewer labels if needed:

- sofa
- wardrobe
- boxes
- tv
- fridge
- washing_machine
- dining_table
- chair
- double_bed
- chest_of_drawers

## 2. Sort Photos

Move downloaded photos into:

```text
training/dataset/raw/<label>/
```

Example:

```text
training/dataset/raw/sofa/training_sofa_2026-05-06T19-30-00.jpg
```

## 3. Annotate Bounding Boxes

For object detection, each photo needs boxes around the object.

Use a labelling tool such as:

- Roboflow
- Label Studio
- CVAT
- Makesense.ai

Export the dataset in YOLO format.

## 4. Train

Use `training/removals_yolo_training_colab.ipynb`.

The notebook trains a YOLO object detector and exports a model for app integration.

## 5. Publish Model

After export, place the web model files under:

```text
models/removals/
```

Then update:

```text
custom-model.json
```

Set:

```json
{
  "enabled": true,
  "model_url": "./models/removals/model.json",
  "labels_url": "./models/removals/labels.json"
}
```

## 6. Keep Manual Fallback

Even a trained model will miss items sometimes. Keep manual add/edit controls in the app.
