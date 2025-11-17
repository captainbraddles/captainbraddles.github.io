var payloadUrl = "https://script.google.com/macros/s/AKfycbzE09QC8KSBQv0fVQ2pV5lND_iMvEbdQ7GnSgltmvGsICU0bB9tvFt2ASJtOvxtCg_JgA/exec";

    fetch(payloadUrl) // Replace with your JSON file path or API endpoint
  .then(response => response.json()) // Parse the JSON response
  .then(data => {
    console.log("Brad - " + data.length);
    // 'data' is now a JavaScript object containing your JSON data
    // Proceed to display the data on the webpage
    displayData(data);
  })
  .catch(error => console.error('Error fetching JSON:', error));

  function displayData(data) {
    try {
       
        // Extract rows from the data
        const rows = data.values;

        // Get the table body element
        const tableBody = document.querySelector('#output');

        // Loop through the rows (starting from row 1 to skip headers)
        for (let i = 1; i < rows.length; i++) {
            const row = document.createElement('div');
            
            // Loop through each cell in the row and create a table cell for each
            rows[i].forEach(cell => {
                const cellElement = document.createElement('li');
                cellElement.textContent = cell;
                row.appendChild(cellElement);
            });
            
            // Append the row to the table
            tableBody.appendChild(row);
        }
    } catch (error) {
        console.error('Error fetching Google Sheets data:', error);
    }
}





//   // Example: Displaying an array of objects (if 'data' contains an array)
//   if (Array.isArray(data.items)) {
//     const ul = document.createElement('ul');
//     data.items.forEach(item => {
//       const li = document.createElement('li');
//       li.textContent = item.name; // Assuming 'item' has a 'name' property
//       ul.appendChild(li);
//     });
//     outputDiv.appendChild(ul);
//   }
//}