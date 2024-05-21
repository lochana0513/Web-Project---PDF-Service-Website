document.getElementById('fileInput').addEventListener('change', handleFileSelect, false);

function handleFileSelect(event) {
    const files = event.target.files;
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();

        reader.onload = function(event) {
            const data = event.target.result;
            renderImage(data, file.name);
        };

        reader.readAsDataURL(file);
    }
}

function renderImage(data, fileName) {
    const workArea = document.getElementById('workArea');
    const imageContainer = document.createElement('div');
    const containerId = 'imageContainer_' + new Date().getTime(); // Unique ID for each container
    imageContainer.id = containerId;
    imageContainer.className = 'image-container';
    imageContainer.draggable = true;
    imageContainer.setAttribute('ondragstart', 'drag(event)');

    const img = document.createElement('img');
    img.src = data;
    img.style.width = '100%';
    img.style.height = 'auto';
    img.style.border = '1px solid #ddd';

    const p = document.createElement('p');
    p.textContent = fileName;

    const removeIcon = document.createElement('span');
    removeIcon.className = 'remove-icon';
    removeIcon.innerHTML = '&#10006;'; // Unicode character for cross mark
    removeIcon.onclick = function() {
        workArea.removeChild(imageContainer);
    };

    imageContainer.appendChild(p);
    imageContainer.appendChild(removeIcon);
    imageContainer.appendChild(img);
    workArea.appendChild(imageContainer);
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
    const targetElement = event.target.closest('.image-container');

    if (targetElement) {
        const allContainers = Array.from(workArea.querySelectorAll('.image-container'));
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

// Load PDF-lib library dynamically
async function loadPDFLib() {
    if (typeof PDFDocument === 'undefined') {
        await import('https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js');
    }
}

// Event listener for the JPGtoPDF-button
document.getElementById('JPGtoPDF-button').addEventListener('click', convertImagesToPDF);
async function convertImagesToPDF() {
    await loadPDFLib(); // Ensure PDF-lib is loaded

    const workArea = document.getElementById('workArea');
    const imageContainers = workArea.querySelectorAll('.image-container');

    console.log('Number of image containers:', imageContainers.length); // Log the number of image containers

    // Set the dimensions for the PDF pages
    const pageWidth = 595; // Width of A4 page in points (8.27 inches)
    const pageHeight = 842; // Height of A4 page in points (11.69 inches)

    // Create a new PDF document
    const pdfDoc = await PDFLib.PDFDocument.create();

    // Loop through image containers in order
    for (const container of imageContainers) {
        const img = container.querySelector('img');
        const imgData = img.src;

        try {
            // Embed image in PDF document
            const jpgImage = await pdfDoc.embedJpg(imgData);

            // Add a new page with white background
            const page = pdfDoc.addPage([pageWidth, pageHeight]);
            const { width, height } = jpgImage.scaleToFit(pageWidth, pageHeight);

            // Draw image on the page
            page.drawImage(jpgImage, {
                x: (pageWidth - width) / 2,
                y: (pageHeight - height) / 2,
                width,
                height,
            });
        } catch (error) {
            console.error('Error embedding image:', error);
        }
    }

    try {
        // Save the PDF document
        const pdfBytes = await pdfDoc.save();

        // Convert bytes to Blob
        const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

        // Create a temporary link to download the PDF
        const link = document.createElement('a');
        link.href = URL.createObjectURL(pdfBlob);
        link.download = 'images_to_pdf.pdf';
        link.click();
    } catch (error) {
        console.error('Error saving PDF document:', error);
    }
}
