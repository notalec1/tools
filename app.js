document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Canvas
    const canvas = new fabric.Canvas('c', {
        isDrawingMode: true, // Default to Pen
        backgroundColor: '#ffffff'
    });

    // Brush Settings Defaults
    canvas.freeDrawingBrush.width = 3;
    canvas.freeDrawingBrush.color = '#000000';

    // 2. Responsive Canvas Logic
    const wrapper = document.getElementById('canvas-wrapper');

    function resizeCanvas() {
        // Set canvas dimensions to match the wrapper div exactly
        canvas.setWidth(wrapper.clientWidth);
        canvas.setHeight(wrapper.clientHeight);
        canvas.renderAll();
    }

    // Listen for window resize
    window.addEventListener('resize', resizeCanvas);
    
    // Call once immediately to set initial size
    resizeCanvas();

    // 3. State & Tools
    const colorPicker = document.getElementById('color-picker');
    const sizeSlider = document.getElementById('line-width');
    const fileInput = document.getElementById('file-input');
    
    // Tool Buttons
    const tools = {
        select: document.getElementById('btn-select'),
        pen: document.getElementById('btn-pen'),
        rect: document.getElementById('btn-rect'),
        text: document.getElementById('btn-text'),
        eraser: document.getElementById('btn-eraser'),
        save: document.getElementById('btn-save')
    };

    function setActiveTool(mode) {
        // UI: Remove 'active' class from all, add to current
        Object.keys(tools).forEach(k => {
            if(tools[k] && tools[k].classList) tools[k].classList.remove('active');
        });

        // Logic Switch
        canvas.isDrawingMode = false; // Disable drawing by default
        canvas.selection = true;      // Enable selection by default

        if (mode === 'pen') {
            tools.pen.classList.add('active');
            canvas.isDrawingMode = true;
            canvas.selection = false;
        } 
        else if (mode === 'select') {
            tools.select.classList.add('active');
        }
        else if (mode === 'rect') {
            tools.rect.classList.add('active');
            addShape('rect');
            // Switch back to select mode after adding shape
            setTimeout(() => setActiveTool('select'), 100); 
        }
        else if (mode === 'text') {
            tools.text.classList.add('active');
            addText();
            setTimeout(() => setActiveTool('select'), 100);
        }
    }

    // 4. Object Creation Helpers
    function addShape(type) {
        const center = canvas.getCenter();
        if (type === 'rect') {
            const rect = new fabric.Rect({
                left: center.left - 50,
                top: center.top - 50,
                fill: colorPicker.value, // Use current color
                width: 100,
                height: 100,
                stroke: '#000',
                strokeWidth: 2
            });
            canvas.add(rect);
            canvas.setActiveObject(rect);
        }
    }

    function addText() {
        const center = canvas.getCenter();
        const text = new fabric.IText('Text', {
            left: center.left,
            top: center.top,
            fill: colorPicker.value,
            fontSize: 40
        });
        canvas.add(text);
        canvas.setActiveObject(text);
    }

    // 5. Event Listeners
    tools.select.onclick = () => setActiveTool('select');
    tools.pen.onclick = () => setActiveTool('pen');
    tools.rect.onclick = () => setActiveTool('rect');
    tools.text.onclick = () => setActiveTool('text');
    
    tools.eraser.onclick = () => {
        if(confirm('Clear entire whiteboard?')) {
            canvas.clear();
            canvas.setBackgroundColor('#ffffff', canvas.renderAll.bind(canvas));
        }
    };

    // Color & Size Changes
    colorPicker.addEventListener('input', (e) => {
        const val = e.target.value;
        canvas.freeDrawingBrush.color = val;
        
        // If an object is selected, change its color too
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
            // Handle different object types
            if (activeObj.type === 'i-text') activeObj.set('fill', val);
            else activeObj.set('fill', val);
            canvas.renderAll();
        }
    });

    sizeSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        canvas.freeDrawingBrush.width = val;
    });

    // Save
    tools.save.onclick = () => {
        const json = JSON.stringify(canvas.toJSON());
        const blob = new Blob([json], {type: "application/json"});
        const link = document.createElement('a');
        link.download = `whiteboard-${new Date().toISOString().slice(0,10)}.json`;
        link.href = URL.createObjectURL(blob);
        link.click();
    };

    // Load
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (f) => {
            canvas.loadFromJSON(f.target.result, canvas.renderAll.bind(canvas));
        };
        reader.readAsText(file);
        e.target.value = ''; // Reset
    });

    // 6. INITIALIZATION
    setActiveTool('pen'); // Set default tool to Pen
});
