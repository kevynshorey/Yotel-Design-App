# Caro Basic Export

This folder contains a very simple, client-facing export of the app UI.

## Included

- `caro_basic_app.html`
  - Standalone file (no build tools needed)
  - Basic layout only
  - Simple toolbar
  - Simple layers sidebar
  - Viewer placeholder area
- `caro_basic_app.js`
  - Plain JavaScript behavior for toolbar and layers search
- `caro_basic_data.py`
  - Minimal Python data module for basic defaults
- `caro_basic_data.json`
  - Basic app config/state in JSON form

## Not Included (intentionally removed)

- Advanced generation logic
- Complex scoring systems
- Deployment scripts
- Data pipelines
- External integrations

## How to use

1. Open `caro_basic_app.html` in any browser.
2. Click toolbar buttons to switch view/style labels.
3. Toggle layers in the right sidebar.

## For code review

- JavaScript file: `caro_basic_app.js`
- Python file: `caro_basic_data.py`
- JSON file: `caro_basic_data.json`

## Notes

- Branding text is simplified to **Caro**.
- This export is for presentation and handoff, not full production behavior.
