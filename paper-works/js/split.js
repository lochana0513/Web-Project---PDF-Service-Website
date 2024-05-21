




let rangeCounter = 0; // Counter to generate unique IDs for range inputs
let totalPages; // Variable to store the total number of pages in the PDF

// Function to handle file upload
function handleFileSelect(event) {
    const files = event.target.files;
    if (files.length === 1) {
        const file = files[0];
        const reader = new FileReader();

        reader.onload = async function(event) {
            const data = event.target.result;
            totalPages = await getTotalPagesInPDF(data); // Calculate total pages
            renderPDF(data, file.name);
        };

        reader.readAsDataURL(file);
    } else {
        alert('Please select only one PDF file.');
        // You can optionally clear the file input if multiple files are selected
        event.target.value = null;
    }
}

// Function to calculate total pages in the PDF
async function getTotalPagesInPDF(data) {
    try {
        // Load the PDF document
        const pdfDoc = await PDFLib.PDFDocument.load(data);

        // Get the total number of pages
        return pdfDoc.getPageCount();
    } catch (error) {
        throw error;
    }
}

// Function to render PDF
function renderPDF(data, fileName) {
    const workArea = document.getElementById('workArea');
    // Clear previous content in workArea if needed
    workArea.innerHTML = '';

    const pdfContainer = document.createElement('div');
    pdfContainer.className = 'pdf-container';

    const object = document.createElement('object');
    object.type = 'application/pdf';
    object.data = data;
    object.width = '100%';
    object.height = '100%'; // Adjust height as needed

    const p = document.createElement('p');
    p.textContent = fileName;

    const removeIcon = document.createElement('span');
    removeIcon.className = 'remove-icon';
    removeIcon.innerHTML = '&#10006;'; // Unicode character for cross mark
    removeIcon.onclick = function() {
        workArea.removeChild(pdfContainer);
        location.reload(); // Reload the page
    };

    pdfContainer.appendChild(p);
    pdfContainer.appendChild(removeIcon);
    pdfContainer.appendChild(object);
    workArea.appendChild(pdfContainer);
}

function restrictInputToValidPages(inputField, counterpartInput, totalPages) {
    inputField.addEventListener('input', function() {
        const startValue = inputField.value.trim(); // Trim any leading or trailing whitespace
        const endValue = counterpartInput.value.trim();
        
        // Parse input values to integers
        const startPage = parseInt(startValue);
        const endPage = parseInt(endValue);

        // Check if both inputs contain valid page numbers
        if (!isNaN(startPage) && !isNaN(endPage)) {
          
            
            // Check if start and end page are within valid range
            if (startPage <= endPage || startPage < 1 || endPage < 1 || startPage > totalPages || endPage > totalPages) {
                displayWarningMessage(inputField, `Page range must be between 1 and ${totalPages}`);
                displayWarningMessage(counterpartInput, `Page range must be between 1 and ${totalPages}`);
            } else {
                hideWarningMessage(inputField);
                hideWarningMessage(counterpartInput);
            }
        } else {
            // If input values are not valid integers, show a general warning message
            displayWarningMessage(inputField, 'Please enter valid page numbers');
            displayWarningMessage(counterpartInput, 'Please enter valid page numbers');
        }
    });
}




// Function to display a warning message for invalid ranges
function displayWarningMessage(inputField, message) {
    const warningElement = inputField.parentNode.querySelector('.warning-message');
    if (!warningElement) {
        const warning = document.createElement('span');
        warning.classList.add('warning-message');
        warning.textContent = message;
        inputField.parentNode.appendChild(warning);
    } else {
        warningElement.textContent = message;
    }
}

// Function to hide the warning message
function hideWarningMessage(inputField) {
    const warningElement = inputField.parentNode.querySelector('.warning-message');
    if (warningElement) {
        warningElement.remove();
    }
}

// Function to add a range input field
document.getElementById('addRangeBtn').addEventListener('click', function() {
    var uploadDiv = document.querySelector('.range-div');
    var rangeContainer = document.createElement('div');
    rangeContainer.classList.add('range-input-container');

    var rangeInputs = document.createElement('div');
    rangeInputs.classList.add('range-inputs');

    // Generate unique IDs for start and end range inputs
    const startInputId = `range_start_${rangeCounter}`;
    const endInputId = `range_end_${rangeCounter}`;

    rangeInputs.innerHTML = `
        <input type="text" id="${startInputId}" name="range_start[]" placeholder="Start Page">
        - 
        <input type="text" id="${endInputId}" name="range_end[]" placeholder="End Page">
    `;
    
    var removeButton = document.createElement('button');
    removeButton.classList.add('remove-btn');
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', function() {
        rangeContainer.remove();
    });

    rangeInputs.appendChild(removeButton); // Append remove button to range inputs container

    rangeContainer.appendChild(rangeInputs);
    uploadDiv.appendChild(rangeContainer);

    // Attach event listeners to the newly added range inputs
    const startInput = document.getElementById(startInputId);
    const endInput = document.getElementById(endInputId);

    // Check if totalPages is defined before calling restrictInputToValidPages
    if (totalPages !== undefined) {
        restrictInputToValidPages(startInput, endInput, totalPages);
        restrictInputToValidPages(endInput, startInput, totalPages);
    }

    rangeCounter++; // Increment counter for next range
});

// Function to handle file input change
document.getElementById('fileInput').addEventListener('change', handleFileSelect, false);



document.getElementById('fileInput').addEventListener('change', function() {
    const uploadDivMain = document.querySelector('.upload-div.maindiv');
    if (this.files.length > 0 && this.files[0].type === 'application/pdf') {
        uploadDivMain.style.display = 'block';
        const file = this.files[0];
        const reader = new FileReader();

        reader.onload = async function(event) {
            const data = event.target.result;
            getTotalPagesInPDF(data)
            .then(totalPages => {
                const sub1 = document.querySelector('.win1-container .sub1 h1');
                sub1.textContent = `This PDF will be split into files of ${totalPages} page(s)`;
            })
            .catch(error => {
                console.error('Error loading PDF:', error);
                alert('Error loading PDF. Please try again.');
            });
        };

        reader.readAsDataURL(file);
    } else {
        uploadDivMain.style.display = 'none';
    }
});


document.addEventListener('DOMContentLoaded', function() {
    const win1Btn = document.querySelector('.win1-btn');
    const win2Btn = document.querySelector('.win2-btn');
    const win1Container = document.querySelector('.win1-container');
    const win2Container = document.querySelector('.win2-container');
    
    win1Btn.addEventListener('click', function() {
        win1Container.style.display = 'flex';
        win2Container.style.display = 'none';
    });
    
    win2Btn.addEventListener('click', function() {
        win2Container.style.display = 'flex';
        win1Container.style.display = 'none';
    });
});




// Function to handle splitting PDF based on selected option (Fixed range or Custom ranges)
document.getElementById('split-button').addEventListener('click', function() {
    // Check which splitting option is selected
    const win1Container = document.querySelector('.win1-container');
    const win2Container = document.querySelector('.win2-container');
    const isFixedRangeSelected = win1Container.style.display === 'flex';
    const isCustRangeSelected = win2Container.style.display === 'flex';
    
    if (isFixedRangeSelected) {
        // Split PDF into page by page PDFs
        splitPDFByPages(totalPages);
    } else if (isCustRangeSelected) {
        // Get custom ranges and split PDF accordingly
        const customRanges = getCustomRanges();
        splitPDFByCustomRanges(customRanges);
    }
});

// Function to split PDF into page by page PDFs
async function splitPDFByPages(totalPages) {
    const fileInput = document.getElementById('fileInput');
    const files = fileInput.files;
    
    if (files.length !== 1) {
        alert('Please select a PDF file.');
        return;
    }
    
    const file = files[0];
    const reader = new FileReader();

    reader.onload = async function(event) {
        const data = event.target.result;
        const pdfDoc = await PDFLib.PDFDocument.load(data);
        
        const zip = new JSZip();

        // Iterate over each page and add it to the zip file
        for (let i = 0; i < totalPages; i++) {
            const newPdf = await PDFLib.PDFDocument.create();
            const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
            newPdf.addPage(copiedPage);
            const pdfBytes = await newPdf.save();
            zip.file(`${file.name}_${i + 1}.pdf`, pdfBytes);
        }

        // Generate the zip file and trigger download
        zip.generateAsync({ type: 'blob' }).then(function(content) {
            saveAs(content, `${file.name}_split.zip`);
        });
    };

    reader.readAsArrayBuffer(file);
}
// Function to get custom ranges entered by the user
// Function to get custom ranges entered by the user
function getCustomRanges() {
    const rangeInputs = document.querySelectorAll('.range-inputs');
    const customRanges = [];
    
    rangeInputs.forEach(inputContainer => {
        const startInput = inputContainer.querySelector('input[type="text"][name="range_start[]"]');
        const endInput = inputContainer.querySelector('input[type="text"][name="range_end[]"]');
        
        if (startInput && endInput) {
            const startPage = parseInt(startInput.value.trim());
            const endPage = parseInt(endInput.value.trim());
            
            if (!isNaN(startPage) && !isNaN(endPage)) {
                customRanges.push({ start: startPage, end: endPage });
            }
        }
    });
    
    return customRanges;
}


async function splitPDFByCustomRanges(customRanges) {
    const fileInput = document.getElementById('fileInput');
    const files = fileInput.files;
    
    if (files.length !== 1) {
        alert('Please select a PDF file.');
        return;
    }
    
    const file = files[0];
    const reader = new FileReader();

    reader.onload = async function(event) {
        const data = event.target.result;
        const pdfDoc = await PDFLib.PDFDocument.load(data);
        
        const zip = new JSZip();

        // Iterate over each custom range and add it to the zip file
        for (const range of customRanges) {
            const { start, end } = range;
            const newPdf = await PDFLib.PDFDocument.create();
            
            // Copy pages within the custom range to the new PDF
            for (let i = start - 1; i < end; i++) {
                const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
                newPdf.addPage(copiedPage);
            }
            
            const pdfBytes = await newPdf.save();
            zip.file(`${file.name}_${start}-${end}.pdf`, pdfBytes);
        }

        // Generate the zip file and trigger download
        zip.generateAsync({ type: 'blob' }).then(function(content) {
            saveAs(content, `${file.name}_split.zip`);
        });
    };

    reader.readAsArrayBuffer(file);
}

// Function to download PDF bytes as a file
function downloadPDF(pdfBytes, filename) {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}
