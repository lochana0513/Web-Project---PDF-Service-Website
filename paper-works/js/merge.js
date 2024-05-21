document.getElementById('fileInput').addEventListener('change', handleFileSelect, false);

function handleFileSelect(event) {
    const files = event.target.files;
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();

        reader.onload = function(event) {
            const data = event.target.result;
            renderPDF(data, file.name);
        };

        reader.readAsDataURL(file);
    }
}

function renderPDF(data, fileName) {
    const workArea = document.getElementById('workArea');
    const pdfContainer = document.createElement('div');
    const containerId = 'pdfContainer_' + new Date().getTime(); // Unique ID for each container
    pdfContainer.id = containerId;
    pdfContainer.className = 'pdf-container';
    pdfContainer.draggable = true;
    pdfContainer.setAttribute('ondragstart', 'drag(event)');

    const object = document.createElement('object');
    object.type = 'application/pdf';
    object.data = data;
    
    object.width = '100%';
    object.height = '250px';
    object.style.border = '1px solid #ddd';

    const p = document.createElement('p');
    p.textContent = fileName;

    const removeIcon = document.createElement('span');
    removeIcon.className = 'remove-icon';
    removeIcon.innerHTML = '&#10006;'; // Unicode character for cross mark
    removeIcon.onclick = function() {
        workArea.removeChild(pdfContainer);
    };

    pdfContainer.appendChild(p);
    pdfContainer.appendChild(removeIcon);
    pdfContainer.appendChild(object);
    workArea.appendChild(pdfContainer);
}


function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
}

function drop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text");
    const draggedElement = document.getElementById(data);
    const workArea = document.getElementById('workArea');
    const targetElement = event.target.closest('.pdf-container');

    if (targetElement) {
        const allContainers = Array.from(workArea.querySelectorAll('.pdf-container'));
        const draggedIndex = allContainers.indexOf(draggedElement);
        const targetIndex = allContainers.indexOf(targetElement);

        // Swap the positions of the dragged and target elements in the grid layout
        if (draggedIndex !== targetIndex) {
            // Remove the dragged element from its current position
            workArea.removeChild(draggedElement);

            // Reinsert the dragged element at the target position
            if (draggedIndex < targetIndex) {
                // If the dragged element is before the target element, insert before the target element
                workArea.insertBefore(draggedElement, targetElement.nextSibling);
            } else {
                // If the dragged element is after the target element, insert before the target element
                workArea.insertBefore(draggedElement, targetElement);
            }
        }
    }
}

async function mergePDFsFromContainers() {
    const workArea = document.getElementById('workArea');
    const pdfContainers = workArea.querySelectorAll('.pdf-container');
    
    if (pdfContainers.length < 2) {
        alert('Please add at least two PDF files to merge.');
        return;
    }

    const mergedPdf = await PDFLib.PDFDocument.create();
    for (const pdfContainer of pdfContainers) {
        const object = pdfContainer.querySelector('object');
        const pdfUrl = object.data;
        
        // Fetch PDF data from the URL
        const response = await fetch(pdfUrl);
        const pdfBytes = await response.arrayBuffer();
        
        // Load PDF and merge its pages into the merged PDF document
        const pdf = await PDFLib.PDFDocument.load(pdfBytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    // Save and download the merged PDF
    const mergedPdfBytes = await mergedPdf.save();
    downloadPDF(mergedPdfBytes, 'merged.pdf');
}

function downloadPDF(pdfBytes, filename) {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

document.getElementById('combine-button').addEventListener('click', mergePDFsFromContainers);
