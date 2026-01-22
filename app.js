document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Canvas
    const canvas = new fabric.Canvas('c', {
        isDrawingMode: true, // Start in Pen mode
        backgroundColor: '#ffffff',
        selection: false     // Disable group selection in drawing mode
    });

    // Brush Defaults
    canvas.freeDrawingBrush.width = 3;
    canvas.freeDrawingBrush.color = '#000000';

    // 2. ROBUST Sizing Logic (Replaces window.resize)
    const wrapper = document.getElementById('canvas-wrapper');

    const resizeCanvas = () => {
        // Get the exact pixel size of the container
        const width = wrapper.clientWidth;
        const height = wrapper.clientHeight;

        if (width > 0 && height > 0) {
            canvas.setWidth(width);
            canvas.setHeight(height);
            canvas.renderAll();
        }
    };

    // Observer: Triggers whenever the wrapper changes size (including load)
    const observer = new ResizeObserver(() => {
        resizeCanvas();
    });
    observer.observe(wrapper);


    // 3. Tool Logic
    const tools = {
        select: document.getElementById('btn-select'),
        pen: document.getElementById('btn-pen'),
        rect: document.getElementById('btn-rect'),
        text: document.getElementById('btn-text'),
        eraser: document.getElementById('btn-eraser'),
        save: document.getElementById('btn-save')
    };

    const colorPicker = document.getElementById('color-picker');
    const sizeSlider = document.getElementById('line-width');
    const fileInput = document.getElementById('file-input');

    function setActiveTool(mode) {
        // Clear active classes safely
        Object.values(tools).forEach(btn => {
            if (btn) btn.classList.remove('active');
        });

        // Set Canvas State Defaults
        canvas.isDrawingMode = false;
        canvas.selection = true;
        canvas.defaultCursor = 'default';

        // Apply Mode Logic
        switch (mode) {
            case 'pen':
                if(tools.pen) tools.pen.classList.add('active');
                canvas.isDrawingMode = true;
                canvas.selection = false;
                canvas.freeDrawingBrush.color = colorPicker.value;
                canvas.freeDrawingBrush.width = parseInt(sizeSlider.value, 10);
                break;

            case 'select':
                if(tools.select) tools.select.classList.add('active');
                canvas.selection = true;
                break;

            case 'rect':
                if(tools.rect) tools.rect.classList.add('active');
                addShape('rect');
                // Auto-revert to select so they can move the shape
                setTimeout(() => setActiveTool('select'), 200);
                break;

            case 'text':
                if(tools.text) tools.text.classList.add('active');
                addText();
                setTimeout(() => setActiveTool('select'), 200);
                break;
        }
    }

    // 4. Object Creation Helpers
    function addShape(type) {
        // Place in center of current view
        const vpt = canvas.viewportTransform; 
        // Simple center calculation
        const centerX = canvas.getWidth() / 2;
        const centerY = canvas.getHeight() / 2;

        if (type === 'rect') {
            const rect = new fabric.Rect({
                left: centerX - 50,
                top: centerY - 50,
                fill: colorPicker.value,
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
        const centerX = canvas.getWidth() / 2;
        const centerY = canvas.getHeight() / 2;
        
        const text = new fabric.IText('Type Here', {
            left: centerX - 60,
            top: centerY - 20,
            fill: colorPicker.value,
            fontSize: 40
        });
        canvas.add(text);
        canvas.setActiveObject(text);
    }

    // 5. Event Binding
    if(tools.select) tools.select.onclick = () => setActiveTool('select');
    if(tools.pen) tools.pen.onclick = () => setActiveTool('pen');
    if(tools.rect) tools.rect.onclick = () => setActiveTool('rect');
    if(tools.text) tools.text.onclick = () => setActiveTool('text');
    
    if(tools.eraser) tools.eraser.onclick = () => {
        if(confirm('Clear entire whiteboard?')) {
            canvas.clear();
            canvas.setBackgroundColor('#ffffff', canvas.renderAll.bind(canvas));
        }
    };

    if(colorPicker) colorPicker.addEventListener('input', (e) => {
        const val = e.target.value;
        canvas.freeDrawingBrush.color = val;
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
            activeObj.set('fill', val);
            canvas.renderAll();
        }
    });

    if(sizeSlider) sizeSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        canvas.freeDrawingBrush.width = val;
    });

    if(tools.save) tools.save.onclick = () => {
        const json = JSON.stringify(canvas.toJSON());
        const blob = new Blob([json], {type: "application/json"});
        const link = document.createElement('a');
        link.download = `whiteboard-${new Date().getTime()}.json`;
        link.href = URL.createObjectURL(blob);
        link.click();
    };

    if(fileInput) fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (f) => {
            canvas.loadFromJSON(f.target.result, canvas.renderAll.bind(canvas));
        };
        reader.readAsText(file);
        e.target.value = '';
    });

    // 6. Force Start
    setActiveTool('pen');
});
