// Initialize PDF library
const { jsPDF } = window.jspdf;

// Add blank item row
function addRow() {
  const table = document.querySelector("#itemsTable tbody");
  const row = table.insertRow();
  
  row.innerHTML = `
    <td><input type="text" class="item-desc" placeholder="Web design service"></td>
    <td><input type="number" class="item-qty" value="1" min="1"></td>
    <td><input type="number" class="item-price" placeholder="50.00" step="0.01"></td>
    <td class="item-total">0.00</td>
    <td><button class="remove-btn" onclick="this.closest('tr').remove()">❌</button></td>
  `;
  
  // Add calculators
  row.querySelectorAll(".item-qty, .item-price").forEach(input => {
    input.addEventListener("input", calculateTotals);
  });
}

// Calculate item totals
function calculateTotals() {
  document.querySelectorAll("#itemsTable tbody tr").forEach(row => {
    const qty = parseFloat(row.querySelector(".item-qty").value) || 0;
    const price = parseFloat(row.querySelector(".item-price").value) || 0;
    const total = (qty * price).toFixed(2);
    row.querySelector(".item-total").textContent = total;
  });
}

// Create the invoice
function makeInvoice() {
  // Get all values
  const bizName = document.getElementById("bizName").value;
  const crn = document.getElementById("crn").value;
  const vat = document.getElementById("vat").value;
  const clientName = document.getElementById("clientName").value;
  const clientAddress = document.getElementById("clientAddress").value;
  const invoiceNo = document.getElementById("invoiceNo").value;
  const dueDate = document.getElementById("dueDate").value;
  const vatRate = parseFloat(document.getElementById("vatRate").value);
  const reverseCharge = document.getElementById("reverseCharge").checked;
  
  // Calculate totals
  let subtotal = 0;
  document.querySelectorAll(".item-total").forEach(cell => {
    subtotal += parseFloat(cell.textContent) || 0;
  });
  
  const vatAmount = reverseCharge ? 0 : subtotal * vatRate;
  const total = subtotal + vatAmount;
  
  // Create PDF
  window.invoicePDF = new jsPDF();
  const doc = window.invoicePDF;
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(26, 58, 95);
  doc.text("INVOICE", 105, 20, null, null, "center");
  
  // Business info
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`From: ${bizName}`, 20, 40);
  if(crn) doc.text(`Company No: ${crn}`, 20, 47);
  if(vat) doc.text(`VAT No: ${vat}`, 20, 54);
  
  // Client info
  doc.text(`To: ${clientName}`, 20, 65);
  doc.text(clientAddress, 20, 72, { maxWidth: 80 });
  
  // Invoice details
  doc.text(`Invoice #: ${invoiceNo}`, 150, 40);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 47);
  doc.text(`Due: ${new Date(dueDate).toLocaleDateString()}`, 150, 54);
  
  // Line items table
  doc.autoTable({
    startY: 85,
    head: [['Description', 'Qty', 'Unit Price', 'Total']],
    body: getItemData(),
    theme: 'grid',
    headStyles: { fillColor: [42, 90, 140] }
  });
  
  // Totals
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.text(`Subtotal: £${subtotal.toFixed(2)}`, 150, finalY);
  doc.text(`VAT: £${vatAmount.toFixed(2)}`, 150, finalY + 7);
  doc.setFont(undefined, 'bold');
  doc.text(`TOTAL: £${total.toFixed(2)}`, 150, finalY + 17);
  
  // UK Compliance
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100);
  const complianceY = finalY + 30;
  doc.text("This invoice complies with UK invoicing requirements", 20, complianceY);
  
  if(reverseCharge) {
    doc.text("VAT Reverse Charge applied per UK VAT Act 1994", 20, complianceY + 5);
  }
  
  // Show download button
  document.getElementById("preview").classList.remove("hidden");
}

// Get item data for table
function getItemData() {
  const rows = [];
  document.querySelectorAll("#itemsTable tbody tr").forEach(row => {
    const desc = row.querySelector(".item-desc").value || "Item";
    const qty = row.querySelector(".item-qty").value || "1";
    const price = row.querySelector(".item-price").value || "0";
    const total = row.querySelector(".item-total").textContent;
    rows.push([desc, qty, `£${price}`, `£${total}`]);
  });
  return rows;
}

// Save as PDF
function savePDF() {
  const invoiceNo = document.getElementById("invoiceNo").value;
  window.invoicePDF.save(`invoice_${invoiceNo}.pdf`);
}

// Add first row on load
addRow();
