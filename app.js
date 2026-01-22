document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Canvas
    const canvas = new fabric.Canvas('c', {
        isDrawingMode: false,
        backgroundColor: '#ffffff' 
    });

    // Resize canvas to fill window
    function resizeCanvas() {
        const container = document.getElementById('canvas-container');
        canvas.setWidth(container.offsetWidth);
        canvas.setHeight(container.offsetHeight);
        canvas.renderAll();
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Initial sizing

    // 2. State Management
    let currentMode = 'select'; // select, pen, rect, circle
    let currentColor = '#000000';
    let currentSize = 3;

    // DOM Elements
    const colorPicker = document.getElementById('color-picker');
    const sizeSlider = document.getElementById('line-width');
    const fileInput = document.getElementById('file-input');
    
    const btns = {
        select: document.getElementById('btn-select'),
        pen: document.getElementById('btn-pen'),
        rect: document.getElementById('btn-rect'),
        circle: document.getElementById('btn-circle'),
        text: document.getElementById('btn-text'),
        clear: document.getElementById('btn-clear'),
        save: document.getElementById('btn-save')
    };

    // 3. Helper: Set Active Button UI
    function setActiveTool(mode) {
        currentMode = mode;
        // Reset button styles
        Object.values(btns).forEach(b => {
            if(b) b.classList.remove('active');
        });

        // Set active class if button exists for mode
        if (btns[mode]) btns[mode].classList.add('active');

        // Configure Canvas based on mode
        if (mode === 'pen') {
            canvas.isDrawingMode = true;
            canvas.freeDrawingBrush.color = currentColor;
            canvas.freeDrawingBrush.width = parseInt(currentSize, 10);
        } else {
            canvas.isDrawingMode = false;
        }
    }

    // 4. Tool Event Listeners
    btns.select.onclick = () => setActiveTool('select');
    btns.pen.onclick = () => setActiveTool('pen');
    
    btns.rect.onclick = () => {
        setActiveTool('rect');
        const rect = new fabric.Rect({
            left: 100, top: 100, fill: currentColor, width: 100, height: 60
        });
        canvas.add(rect);
        canvas.setActiveObject(rect);
    };

    btns.circle.onclick = () => {
        setActiveTool('circle');
        const circle = new fabric.Circle({
            left: 150, top: 150, fill: currentColor, radius: 50
        });
        canvas.add(circle);
        canvas.setActiveObject(circle);
    };

    btns.text.onclick = () => {
        setActiveTool('text');
        const text = new fabric.IText('Type here', {
            left: 200, top: 200, fill: currentColor, fontSize: 30
        });
        canvas.add(text);
        canvas.setActiveObject(text);
    };

    btns.clear.onclick = () => {
        if(confirm('Clear entire whiteboard?')) {
            canvas.clear();
            canvas.setBackgroundColor('#ffffff', canvas.renderAll.bind(canvas));
        }
    };

    // 5. Settings Listeners
    colorPicker.addEventListener('input', (e) => {
        currentColor = e.target.value;
        canvas.freeDrawingBrush.color = currentColor;
        
        // Update selected object if any
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
            activeObj.set('fill', currentColor);
            canvas.renderAll();
        }
    });

    sizeSlider.addEventListener('input', (e) => {
        currentSize = parseInt(e.target.value, 10);
        canvas.freeDrawingBrush.width = currentSize;
    });

    // 6. File I/O Logic

    // SAVE (Export JSON)
    btns.save.onclick = () => {
        const json = JSON.stringify(canvas.toJSON());
        const blob = new Blob([json], {type: "application/json"});
        const link = document.createElement('a');
        link.download = `whiteboard-${Date.now()}.json`;
        link.href = URL.createObjectURL(blob);
        link.click();
    };

    // LOAD (Import JSON or .flipchart stub)
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        // Handle .json
        if (file.name.endsWith('.json')) {
            reader.onload = (f) => {
                const data = f.target.result;
                canvas.loadFromJSON(data, canvas.renderAll.bind(canvas));
            };
            reader.readAsText(file);
        } 
        // Handle .flipchart (Placeholder)
        else if (file.name.endsWith('.flipchart')) {
            alert("Note: .flipchart files are a proprietary binary format.\n\n" +
                  "To support this, we would need a server-side parser or a complex binary reader.\n" +
                  "Currently, please use the native .json format for saving/loading.");
        }
        else {
            alert("Unsupported file format.");
        }
        
        // Reset input so same file can be selected again
        e.target.value = '';
    });
});
