# Custom Removals AI Training

The current app uses a general COCO-SSD model. It is fast, but it was not trained specifically for removals work. A proper removals AI needs labelled photos of the actual items you want the app to recognise.

## Labels To Collect First

Start with these labels:

- sofa
- armchair
- dining_table
- chair
- double_bed
- wardrobe
- chest_of_drawers
- fridge
- washing_machine
- tv
- boxes
- bicycle
- plant
- microwave
- laptop
- suitcase
- lamp
- mirror

## Capture Rules

Use the phone app's Training Capture section.

For each label, collect at least 100 clear photos. Better is 300-500 photos per label.

Capture:

- Different rooms and lighting.
- Different distances.
- Front, side, and angled views.
- Cluttered real homes, not only perfect catalogue-style photos.
- Partially visible items.
- Multiple examples of the same item type.

Avoid:

- Blurry photos.
- Photos where the item is tiny.
- Photos with the wrong label.
- Private customer information in frame.

## Training Pipeline

1. Capture labelled photos from the phone app.
2. Put photos into folders by label.
3. Annotate boxes around each item using an object-detection labelling tool.
4. Train a custom object-detection model.
5. Export the model to TensorFlow.js format.
6. Place the model files under `models/removals/`.
7. Update `custom-model.example.json` and wire the app to load the custom model.

## Practical Target

For a first commercial model, aim for:

- 15-20 labels.
- 100-300 labelled photos per label.
- Real home survey footage/photos.
- A test set kept separate from training.

The app should keep manual item entry as a fallback, because even a trained model will occasionally miss or misclassify items.
