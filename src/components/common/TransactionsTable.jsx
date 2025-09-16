import React from 'react';
import '/src/styles/Dashboard.css';

const TransactionsTable = ({ transactions }) => (
  <div className="table-responsive">
    <table className="table transactions-table align-middle">
      <thead>
        <tr>
          <th><input type="checkbox" className="form-check-input table-checkbox" /></th>
          <th>TransactioNN No</th>
          <th><div className="table-header-sortable">Buyer Name <img src="/assets/chevron-down.png" alt="" className="icon-img-sm" /></div></th>
          <th>Invoice</th>
          <th>Purchase Date</th>
          <th>Total Amount</th>
          <th>Payment Method</th>
          <th><div className="table-header-sortable">Payment Status <img src="/assets/chevron-down.png" alt="" className="icon-img-sm" /></div></th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map(t => (
          <tr key={t.id}>
            <td><input type="checkbox" className="form-check-input table-checkbox" /></td>
            <td className="fw-medium">{t.id}</td>
            <td><div className="buyer-info"><img src={t.avatar} alt={t.name} /><span>{t.name}</span></div></td>
            <td>{t.invoice}</td>
            <td>{t.date}</td>
            <td className="fw-medium">{t.amount}</td>
            <td>{t.payment}</td>
            <td><span className={`status ${t.status.toLowerCase()}`}>{t.status}</span></td>
            <td><div className="action-icons">
              <img src="/assets/eye.png" alt="View" className="icon-img"/>
              <img src="/assets/edit.png" alt="Edit" className="icon-img"/>
              <img src="/assets/trash.png" alt="Delete" className="icon-img"/>
            </div></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default TransactionsTable;
