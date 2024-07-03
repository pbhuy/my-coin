import React, { useEffect, useState } from "react";
import BlockDetail from "./components/TransactionHistory/BlockDetail";
import LastestTransactions from "./components/TransactionHistory/LastestTransactions";
import LastestBlocks from "./components/TransactionHistory/LastestBlocks";
import DashboardLayout from "./components/Layout/DashboardLayout";
import TransactionDetail from "./components/TransactionHistory/TransactionDetail";
import api from "../../../../../../core/api";

export  const HistoryLog = () => {
  const [blocks, setBlocks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(
    null
  );

  useEffect(() => {
    const fetchBlocks = async () => {
      const res = await api.get("/blocks");
      if (res.status === 200) {
        setBlocks(res.data);
      }
    };

    const fetchTxs = async () => {
      const res = await api.get("/transactions");
      if (res.status === 200) {
        console.log(res.data);
        setTransactions(res.data.sort(function(x, y){
          return new Date(x.timeStamp).getTime() - new Date(y.timeStamp).getTime();
        }).reverse());
      }
    };

    fetchBlocks();
    fetchTxs();
  }, []);

  return (
    <DashboardLayout>
      {selectedBlock == null && selectedTransaction == null ? (
        <div>
          {" "}
          <div className="mb-10 text-3xl font-medium">History</div>
          <div className="flex w-full space-x-3">
            <LastestBlocks blocks={blocks} selectBlock={setSelectedBlock} />
            <LastestTransactions
              transactions={transactions}
              selectTransaction={setSelectedTransaction}
            />
          </div>
        </div>
      ) : null}
      {selectedBlock != null ? (
        <BlockDetail
          block={blocks[selectedBlock]}
          index={selectedBlock}
          selectBlock={setSelectedBlock}
        />
      ) : null}
      {selectedTransaction != null ? (
        <TransactionDetail
          transaction={transactions[selectedTransaction]}
          selectTransaction={setSelectedTransaction}
        />
      ) : null}
    </DashboardLayout>
  );
};

