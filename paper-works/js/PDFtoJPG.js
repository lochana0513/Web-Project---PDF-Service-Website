document.getElementById('fileInput').addEventListener('change', handleFileSelect);

function handleFileSelect(event) {
    const file = event.target.files[0]; // Get the uploaded file

    if (file.type === 'application/pdf') {
        const reader = new FileReader(); // Create a FileReader to read the uploaded file

        reader.onload = function (e) {
            const pdfData = e.target.result; // Get the data URL representing the PDF

            // Clear the existing content in the work area
            const workArea = document.getElementById('workArea');
            workArea.innerHTML = '';

            // Load the PDF document using PDF.js
            pdfjsLib.getDocument({ data: pdfData }).promise.then(pdf => {
                // Calculate the number of pages
                const numPages = pdf.numPages;

                // Iterate through each page
                for (let pageIndex = 1; pageIndex <= numPages; pageIndex++) {
                    // Create a container for each page
                    const pageContainer = document.createElement('div');
                    pageContainer.classList.add('page-container');

                    // Create a canvas for rendering the page
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');

                    // Set canvas size
                    canvas.width = 200; // Adjust width as needed
                    canvas.height = 300; // Adjust height as needed

                    // Render PDF page into canvas context
                    pdf.getPage(pageIndex).then(page => {
                        const viewport = page.getViewport({ scale: 1.0 });
                        const scale = canvas.width / viewport.width;
                        const scaledViewport = page.getViewport({ scale });

                        page.render({
                            canvasContext: context,
                            viewport: scaledViewport
                        }).promise.then(() => {
                            // Append canvas to the page container
                            pageContainer.appendChild(canvas);
                        });
                    });

                    // Append page container to work area
                    workArea.appendChild(pageContainer);
                }
            });
        };

        reader.readAsArrayBuffer(file); // Read the uploaded file as an ArrayBuffer
    } else {
        alert('Please upload a PDF file.');
    }
}

document.getElementById('pdftoimg-button').addEventListener('click', convertPDFToImages);

function convertPDFToImages() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0]; // Get the uploaded file

    if (file && file.type === 'application/pdf') {
        const reader = new FileReader(); // Create a FileReader to read the uploaded file

        reader.onload = function (e) {
            const pdfData = e.target.result; // Get the data URL representing the PDF

            // Load the PDF document using PDF.js
            pdfjsLib.getDocument({ data: pdfData }).promise.then(pdf => {
                const numPages = pdf.numPages;
                const zip = new JSZip(); // Create a zip file using JSZip library

                // Iterate through each page
                for (let pageIndex = 1; pageIndex <= numPages; pageIndex++) {
                    pdf.getPage(pageIndex).then(page => {
                        // Render PDF page into a canvas
                        const viewport = page.getViewport({ scale: 2.0 }); // Render at 2x scale for higher resolution
                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d');
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;

                        const renderContext = {
                            canvasContext: context,
                            viewport: viewport
                        };
                        page.render(renderContext).promise.then(() => {
                            // Convert canvas to data URL (PNG format) with maximum quality
                            const imageDataURL = canvas.toDataURL('image/png', 1.0);

                            // Add image to the zip file
                            zip.file(`page_${pageIndex}.png`, imageDataURL.split(';base64,')[1], { base64: true });

                            // If all pages are processed, generate the zip file
                            if (pageIndex === numPages) {
                                zip.generateAsync({ type: 'blob' }).then(function (content) {
                                    // Create a download link for the zip file
                                    const link = document.createElement('a');
                                    link.href = URL.createObjectURL(content);
                                    link.download = 'images.zip';
                                    link.click();
                                });
                            }
                        });
                    });
                }
            });
        };

        reader.readAsArrayBuffer(file); // Read the uploaded file as an ArrayBuffer
    } else {
        alert('Please upload a PDF file.');
    }
}
