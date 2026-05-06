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
2. Use "Find Examples Online" to research what each class looks like, but do not blindly copy copyrighted images into a commercial dataset.
3. Put your own captured photos into folders by label.
4. Annotate boxes around each item using an object-detection labelling tool.
5. Train a custom object-detection model.
6. Export the model to TensorFlow.js format.
7. Place the model files under `models/removals/`.
8. Update `custom-model.json` so the hosted phone app can discover the online model.

## Practical Target

For a first commercial model, aim for:

- 15-20 labels.
- 100-300 labelled photos per label.
- Real home survey footage/photos.
- A test set kept separate from training.

The app should keep manual item entry as a fallback, because even a trained model will occasionally miss or misclassify items.

## Internet Learning

The phone app can now help research labels online and check for a published custom model config. It does not automatically train from the open internet. For a commercial app, automatic internet scraping is risky because images may be copyrighted, mislabelled, or irrelevant.

The recommended route is:

1. Use internet search for reference only.
2. Capture your own real removals photos.
3. Train on owned/licensed data.
4. Publish the trained TensorFlow.js model.
5. Set `custom-model.json` to `"enabled": true`.
