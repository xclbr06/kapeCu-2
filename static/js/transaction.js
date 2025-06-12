document.getElementById('search-query').addEventListener('input', function() {
    const query = this.value.toLowerCase();
    const transactions = document.querySelectorAll('.transaction-item');
    
    transactions.forEach(transaction => {
        const receiptId = transaction.children[0].textContent.toLowerCase();
        const staffName = transaction.children[1].textContent.toLowerCase();
        if (receiptId.includes(query) || staffName.includes(query)) {
            transaction.style.display = '';
        } else {
            transaction.style.display = 'none';
        }
    });
});

document.getElementById('clear-date-button').addEventListener('click', function() {
    document.querySelector('input[name="startdate"]').value = '';
    document.querySelector('input[name="enddate"]').value = '';
    document.getElementById('filter-form').submit();
});

document.getElementById('clear-search-button').addEventListener('click', function() {
    document.getElementById('search-query').value = '';
    const transactions = document.querySelectorAll('.transaction-item');
    transactions.forEach(transaction => {
        transaction.style.display = '';
    });
});

function downloadFile(filename, content, mimeType) {
    var blob = new Blob([content], { type: mimeType });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    setTimeout(function() {
        URL.revokeObjectURL(link.href);
    }, 100);
}

function exportTableToCSV(filename) {
    var table = document.querySelector('table');
    if (!table) return;
    var rows = table.querySelectorAll('tbody tr');
    var csv = [];
    var headers = table.querySelectorAll('thead th');
    var headerRow = [];
    var skip = headers.length - 1; 
    if (headers.length > 7) skip = headers.length - 2; 
    for (var i = 0; i < skip; i++) {
        headerRow.push('"' + headers[i].innerText.replace(/"/g, '""') + '"');
    }
    csv.push(headerRow.join(','));
    
    rows.forEach(function(row) {
        if (row.style.display === "none") return;
        var cols = row.querySelectorAll('td');
        var rowData = [];
        for (var i = 0; i < skip; i++) {
            rowData.push('"' + cols[i].innerText.replace(/"/g, '""') + '"');
        }
        csv.push(rowData.join(','));
    });
    downloadFile(filename, csv.join('\n'), 'text/csv');
}

function exportTableToExcel(filename) {
    var table = document.querySelector('table');
    if (!table) return;
    var rows = table.querySelectorAll('tbody tr');
    var headers = table.querySelectorAll('thead th');
    var skip = headers.length - 1; 
    if (headers.length > 7) skip = headers.length - 2; 
    
    var html = "<table><thead><tr>";
    for (var i = 0; i < skip; i++) {
        html += "<th>" + headers[i].innerText + "</th>";
    }
    html += "</tr></thead><tbody>";
    
    rows.forEach(function(row) {
        if (row.style.display === "none") return;
        var cols = row.querySelectorAll('td');
        html += "<tr>";
        for (var i = 0; i < skip; i++) {
            html += "<td>" + cols[i].innerText + "</td>";
        }
        html += "</tr>";
    });
    html += "</tbody></table>";
    
    var uri = 'data:application/vnd.ms-excel,' + encodeURIComponent(html);
    var link = document.createElement('a');
    
    if (!filename.endsWith('.xls')) filename = filename.replace(/\.xlsx$/i, '.xls');
    link.href = uri;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

window.downloadFile = downloadFile;
window.exportTableToCSV = exportTableToCSV;
window.exportTableToExcel = exportTableToExcel;