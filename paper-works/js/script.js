// Define an array of service data objects
var servicesData = [
    {
        id:"mergePDF",
        title: "Merge PDF",
        description: "Merge your PDFs in your preferred order effortlessly with the simplest PDF merger on the market.",
        imagePath: "img/layer.png"
    },
    {
        id:"splitPDF",
        title: "Split PDF",
        description: "Easily extract individual pages or entire sets for seamless conversion into separate PDF files.",
        imagePath: "img/split.png"
    },
   

  
    {
        id:"JPGtoPDF",
        title: "JPG to PDF",
        description: "Transform JPG images into PDFs within seconds. ",
        imagePath: "img/image.png"
    },
    {
        id:"PDFtoJPG",
        title: "PDF to JPG",
        description: "Effortlessly transform each PDF page into a JPG or extract all embedded images from the PDF with ease",
        imagePath: "img/pdf.png"
    }
   

    // Add more service data objects as needed
];

// Function to create and append service HTML elements
// Function to create and append service HTML elements
function appendService(serviceData) {
    var serviceDiv = document.createElement("div");
    serviceDiv.classList.add("service-div", "box");

    var serviceImgDiv = document.createElement("div");
    serviceImgDiv.classList.add("service-img");
    var serviceImg = document.createElement("img");
    serviceImg.setAttribute("src", serviceData.imagePath);
    serviceImg.setAttribute("alt", "");
    serviceImgDiv.appendChild(serviceImg);

    var h4 = document.createElement("h4");
    h4.textContent = serviceData.title;

    var h5 = document.createElement("h5");
    h5.textContent = serviceData.description;

    serviceDiv.appendChild(serviceImgDiv);
    serviceDiv.appendChild(h4);
    serviceDiv.appendChild(h5);

    // Attach event listener to handle clicks on service-div elements
    serviceDiv.addEventListener("click", function() {
        handleServiceClick(serviceData.id);
    });

    document.querySelector(".services-div").appendChild(serviceDiv);
}

// Loop through the servicesData array and append each service
servicesData.forEach(function(service) {
    appendService(service);
});



// Function to handle clicking on service-div elements
function handleServiceClick(serviceId) {
    // Determine the webpage URL based on the service ID
    let pageUrl = serviceId + ".html"; // Assuming the HTML files are named according to the service ID
    
    // Redirect the user to the specified webpage
    window.location.href = pageUrl;
}
