import { Utilities } from "../utilities.js";
export class ProjectProgressBar {
    constructor(parent) {
        this.createClickListener = (event) => {
            if (!this.button.contains(event.target)) {
                this.popOut.classList.remove("visible");
                this.removeClickListener();
            }
        };
        this.removeClickListener = () => {
            document.removeEventListener('click', this.createClickListener);
        };
        this.isVisible = elem => !!elem && !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length);
        this.parentElement = Utilities.validateElement(parent);
        this.init();
    }
    init() {
        this.bar = document.createElement('div');
        this.bar.className = 'bar';
        this.parentElement.appendChild(this.bar);
        let innerBorder = document.createElement('div');
        innerBorder.className = 'inner-border';
        this.bar.appendChild(innerBorder);
        this.TotalBudgetBar = document.createElement('div');
        this.TotalBudgetBar.className = 'total-budget';
        this.bar.appendChild(this.TotalBudgetBar);
        this.CommittedPOBar = document.createElement('div');
        this.CommittedPOBar.className = 'committed-po';
        this.bar.appendChild(this.CommittedPOBar);
        this.PendingPOBar = document.createElement('div');
        this.PendingPOBar.className = 'pending-po';
        this.bar.appendChild(this.PendingPOBar);
        this.InvoiceTotalBar = document.createElement('div');
        this.InvoiceTotalBar.className = 'invoice-total';
        this.bar.appendChild(this.InvoiceTotalBar);
        this.InvoicePaidBar = document.createElement('div');
        this.InvoicePaidBar.className = 'invoice-paid';
        this.bar.appendChild(this.InvoicePaidBar);
        this.button = document.createElement('div');
        this.button.className = 'button';
        this.parentElement.appendChild(this.button);
        let anchor = document.createElement('a');
        anchor.className = "action";
        this.button.appendChild(anchor);
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.classList.add("icon");
        svg.style.fill = "#333";
        let use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '/images/icons.svg#angle-right');
        svg.appendChild(use);
        anchor.appendChild(svg);
        anchor.addEventListener("click", () => {
            if (this.popOut.classList.contains("visible")) { //already visible, hide
                this.popOut.classList.remove("visible");
                this.removeClickListener();
            }
            else { //show
                this.popOut.classList.add("visible");
                document.addEventListener("click", this.createClickListener);
            }
        });
        this.popOut = document.createElement("div");
        this.popOut.className = "popOut";
        this.parentElement.appendChild(this.popOut);
        this.createRow("Budget");
        this.createRow("Deposits");
        this.createRow("Committed Purchase Orders");
        this.createRow("Pending Purchase Orders");
        this.createRow("Invoice Totals");
        this.createRow("Invoices Pending");
    }
    Load(data) {
        let budgetTot = data.budgetTot;
        let depositTot = data.depositTot;
        let poCommittedTot = data.poCommittedTot;
        let poPendingTot = data.poPendingTot;
        let invoiceTot = data.invoiceTot;
        let invoicePaidTot = data.invoicePaidTot;
        let totalBudgetPerc = Math.round(((depositTot / budgetTot) * 100) * 100) / 100;
        let committedPOPerc = Math.round(((poCommittedTot / depositTot) * 100) * 100) / 100 * (totalBudgetPerc / 100);
        let pendingPOPerc = Math.round(((poPendingTot / depositTot) * 100) * 100) / 100 * (totalBudgetPerc / 100);
        let invoiceTotalPerc = Math.round(((invoiceTot / poCommittedTot) * 100) * 100) / 100 * (committedPOPerc / 100);
        let invoicePaidPerc = Math.round(((invoicePaidTot / poCommittedTot) * 100) * 100) / 100 * (committedPOPerc / 100);
        this.TotalBudgetBar.style.width = totalBudgetPerc + "%";
        this.CommittedPOBar.style.width = "calc(" + committedPOPerc + "% - 14px)";
        this.PendingPOBar.style.width = pendingPOPerc + "%";
        this.PendingPOBar.style.left = "calc(" + this.CommittedPOBar.style.width + " + 9px)";
        this.InvoiceTotalBar.style.width = "calc(" + invoiceTotalPerc + "% - 24px)";
        this.InvoicePaidBar.style.width = "calc(" + invoicePaidPerc + "% - 28px)";
        var rows = this.popOut.children;
        rows[0].lastElementChild.innerHTML = Utilities.FormatMoney(budgetTot);
        rows[1].lastElementChild.innerHTML = Utilities.FormatMoney(depositTot);
        rows[2].lastElementChild.innerHTML = Utilities.FormatMoney(poCommittedTot);
        rows[3].lastElementChild.innerHTML = Utilities.FormatMoney(poPendingTot);
        rows[4].lastElementChild.innerHTML = Utilities.FormatMoney(invoiceTot);
        rows[5].lastElementChild.innerHTML = Utilities.FormatMoney(invoicePaidTot);
    }
    createRow(name) {
        let row = document.createElement("div");
        let text = document.createElement("div");
        text.innerHTML = name;
        let amount = document.createElement("div");
        amount.innerHTML = "$0.00";
        row.appendChild(text);
        row.appendChild(amount);
        this.popOut.appendChild(row);
    }
}
