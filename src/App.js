import React, { useState, useEffect } from 'react';
// Free KendoReact components only
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { Button } from '@progress/kendo-react-buttons';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import { Input } from '@progress/kendo-react-inputs';
import { DatePicker } from '@progress/kendo-react-dateinputs';
import { TabStrip, TabStripTab } from '@progress/kendo-react-layout';
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import { Notification, NotificationGroup } from '@progress/kendo-react-notification';
import { Form, Field, FormElement } from '@progress/kendo-react-form';
import { Label } from '@progress/kendo-react-labels';
import { Tooltip } from '@progress/kendo-react-tooltip';

// For data operations
import { process } from '@progress/kendo-data-query';

// App Layout Structure
const BlockchainVisualizer = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedBlockchain, setSelectedBlockchain] = useState('bitcoin');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    end: new Date()
  });
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactionDetailsOpen, setTransactionDetailsOpen] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [watchedAddress, setWatchedAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [gridDataState, setGridDataState] = useState({
    sort: [{ field: 'timestamp', dir: 'desc' }],
    skip: 0,
    take: 10
  });

  // Blockchain options for dropdown
  const blockchainOptions = [
    { text: 'Bitcoin', value: 'bitcoin' },
    { text: 'Ethereum', value: 'ethereum' },
    { text: 'Cardano', value: 'cardano' },
    { text: 'Solana', value: 'solana' }
  ];
  
  // Function to get blockchain name from value
  const getBlockchainName = (value) => {
    const option = blockchainOptions.find(opt => opt.value === value);
    return option ? option.text : 'Unknown';
  };

  // Sample transaction data for each blockchain
  const blockchainData = {
    bitcoin: [
      { id: 'btc1234...abc', from: '1abc...123', to: '1def...456', value: 1.234, timestamp: new Date(2023, 2, 15), confirmations: 58 },
      { id: 'btc5678...def', from: '1fed...789', to: '1abc...123', value: 0.5, timestamp: new Date(2023, 2, 14), confirmations: 152 },
      { id: 'btc91011...ghi', from: '1123...def', to: '1456...abc', value: 2.1, timestamp: new Date(2023, 2, 13), confirmations: 255 },
      { id: 'btc1213...jkl', from: '1345...def', to: '1678...abc', value: 0.75, timestamp: new Date(2023, 2, 12), confirmations: 358 },
      { id: 'btc1415...mno', from: '1678...abc', to: '1901...def', value: 1.5, timestamp: new Date(2023, 2, 11), confirmations: 462 },
      { id: 'btc1617...pqr', from: '1901...def', to: '1234...ghi', value: 3.25, timestamp: new Date(2023, 2, 10), confirmations: 512 },
      { id: 'btc1819...stu', from: '1234...ghi', to: '1567...jkl', value: 0.33, timestamp: new Date(2023, 2, 9), confirmations: 624 },
      { id: 'btc2021...vwx', from: '1567...jkl', to: '1890...mno', value: 1.1, timestamp: new Date(2023, 2, 8), confirmations: 782 },
      { id: 'btc2223...yza', from: '1890...mno', to: '1123...pqr', value: 2.4, timestamp: new Date(2023, 2, 7), confirmations: 843 },
      { id: 'btc2425...bcd', from: '1123...pqr', to: '1456...stu', value: 1.8, timestamp: new Date(2023, 2, 6), confirmations: 965 },
    ],
    ethereum: [
      { id: '0x123...abc', from: '0xabc...123', to: '0xdef...456', value: 12.34, timestamp: new Date(2023, 2, 15), confirmations: 35 },
      { id: '0x456...def', from: '0xfed...789', to: '0xabc...123', value: 5.5, timestamp: new Date(2023, 2, 14), confirmations: 89 },
      { id: '0x789...ghi', from: '0x123...def', to: '0x456...abc', value: 22.1, timestamp: new Date(2023, 2, 13), confirmations: 122 },
      { id: '0xabc...123', from: '0x345...def', to: '0x678...abc', value: 7.75, timestamp: new Date(2023, 2, 12), confirmations: 211 },
      { id: '0xdef...456', from: '0x678...abc', to: '0x901...def', value: 15.5, timestamp: new Date(2023, 2, 11), confirmations: 289 },
      { id: '0xghi...789', from: '0x901...def', to: '0x234...ghi', value: 33.25, timestamp: new Date(2023, 2, 10), confirmations: 356 },
      { id: '0xjkl...012', from: '0x234...ghi', to: '0x567...jkl', value: 3.33, timestamp: new Date(2023, 2, 9), confirmations: 412 },
      { id: '0xmno...345', from: '0x567...jkl', to: '0x890...mno', value: 11.1, timestamp: new Date(2023, 2, 8), confirmations: 501 },
      { id: '0xpqr...678', from: '0x890...mno', to: '0x123...pqr', value: 24.4, timestamp: new Date(2023, 2, 7), confirmations: 637 },
      { id: '0xstu...901', from: '0x123...pqr', to: '0x456...stu', value: 18.8, timestamp: new Date(2023, 2, 6), confirmations: 721 },
    ],
    cardano: [
      { id: 'ada123...abc', from: 'addr1abc...123', to: 'addr1def...456', value: 245.67, timestamp: new Date(2023, 2, 15), confirmations: 67 },
      { id: 'ada456...def', from: 'addr1fed...789', to: 'addr1abc...123', value: 190.0, timestamp: new Date(2023, 2, 14), confirmations: 134 },
      { id: 'ada789...ghi', from: 'addr1123...def', to: 'addr1456...abc', value: 521.5, timestamp: new Date(2023, 2, 13), confirmations: 221 },
      { id: 'ada012...jkl', from: 'addr1345...def', to: 'addr1678...abc', value: 375.25, timestamp: new Date(2023, 2, 12), confirmations: 312 },
      { id: 'ada345...mno', from: 'addr1678...abc', to: 'addr1901...def', value: 150.5, timestamp: new Date(2023, 2, 11), confirmations: 398 },
      { id: 'ada678...pqr', from: 'addr1901...def', to: 'addr1234...ghi', value: 625.75, timestamp: new Date(2023, 2, 10), confirmations: 467 },
      { id: 'ada901...stu', from: 'addr1234...ghi', to: 'addr1567...jkl', value: 83.33, timestamp: new Date(2023, 2, 9), confirmations: 589 },
      { id: 'ada234...vwx', from: 'addr1567...jkl', to: 'addr1890...mno', value: 410.1, timestamp: new Date(2023, 2, 8), confirmations: 621 },
      { id: 'ada567...yza', from: 'addr1890...mno', to: 'addr1123...pqr', value: 292.4, timestamp: new Date(2023, 2, 7), confirmations: 742 },
      { id: 'ada890...bcd', from: 'addr1123...pqr', to: 'addr1456...stu', value: 718.8, timestamp: new Date(2023, 2, 6), confirmations: 845 },
    ],
    solana: [
      { id: 'sol123...abc', from: 'sol1abc...123', to: 'sol1def...456', value: 47.23, timestamp: new Date(2023, 2, 15), confirmations: 1024 },
      { id: 'sol456...def', from: 'sol1fed...789', to: 'sol1abc...123', value: 35.5, timestamp: new Date(2023, 2, 14), confirmations: 2048 },
      { id: 'sol789...ghi', from: 'sol1123...def', to: 'sol1456...abc', value: 92.1, timestamp: new Date(2023, 2, 13), confirmations: 3072 },
      { id: 'sol012...jkl', from: 'sol1345...def', to: 'sol1678...abc', value: 27.75, timestamp: new Date(2023, 2, 12), confirmations: 4096 },
      { id: 'sol345...mno', from: 'sol1678...abc', to: 'sol1901...def', value: 55.5, timestamp: new Date(2023, 2, 11), confirmations: 5120 },
      { id: 'sol678...pqr', from: 'sol1901...def', to: 'sol1234...ghi', value: 103.25, timestamp: new Date(2023, 2, 10), confirmations: 6144 },
      { id: 'sol901...stu', from: 'sol1234...ghi', to: 'sol1567...jkl', value: 13.33, timestamp: new Date(2023, 2, 9), confirmations: 7168 },
      { id: 'sol234...vwx', from: 'sol1567...jkl', to: 'sol1890...mno', value: 71.1, timestamp: new Date(2023, 2, 8), confirmations: 8192 },
      { id: 'sol567...yza', from: 'sol1890...mno', to: 'sol1123...pqr', value: 84.4, timestamp: new Date(2023, 2, 7), confirmations: 9216 },
      { id: 'sol890...bcd', from: 'sol1123...pqr', to: 'sol1456...stu', value: 68.8, timestamp: new Date(2023, 2, 6), confirmations: 10240 },
    ]
  };
  
  // Chart data for each blockchain
  const blockchainChartData = {
    bitcoin: [
      { date: 'Mar 10', count: 325, value: 156.23 },
      { date: 'Mar 11', count: 410, value: 198.45 },
      { date: 'Mar 12', count: 352, value: 172.56 },
      { date: 'Mar 13', count: 381, value: 187.32 },
      { date: 'Mar 14', count: 398, value: 192.11 },
      { date: 'Mar 15', count: 437, value: 212.98 },
      { date: 'Mar 16', count: 465, value: 228.76 },
    ],
    ethereum: [
      { date: 'Mar 10', count: 1256, value: 856.23 },
      { date: 'Mar 11', count: 1342, value: 911.45 },
      { date: 'Mar 12', count: 1485, value: 972.56 },
      { date: 'Mar 13', count: 1591, value: 1087.32 },
      { date: 'Mar 14', count: 1423, value: 892.11 },
      { date: 'Mar 15', count: 1527, value: 912.98 },
      { date: 'Mar 16', count: 1689, value: 1028.76 },
    ],
    cardano: [
      { date: 'Mar 10', count: 521, value: 356.23 },
      { date: 'Mar 11', count: 610, value: 398.45 },
      { date: 'Mar 12', count: 552, value: 372.56 },
      { date: 'Mar 13', count: 581, value: 387.32 },
      { date: 'Mar 14', count: 598, value: 392.11 },
      { date: 'Mar 15', count: 637, value: 412.98 },
      { date: 'Mar 16', count: 665, value: 428.76 },
    ],
    solana: [
      { date: 'Mar 10', count: 2325, value: 1156.23 },
      { date: 'Mar 11', count: 2410, value: 1198.45 },
      { date: 'Mar 12', count: 2352, value: 1172.56 },
      { date: 'Mar 13', count: 2381, value: 1187.32 },
      { date: 'Mar 14', count: 2398, value: 1192.11 },
      { date: 'Mar 15', count: 2437, value: 1212.98 },
      { date: 'Mar 16', count: 2465, value: 1228.76 },
    ]
  };
  
  // Pie chart data for each blockchain
  const blockchainPieChartData = {
    bitcoin: [
      { category: "0-500KB", value: 35 },
      { category: "500KB-1MB", value: 40 },
      { category: "1MB-1.5MB", value: 15 },
      { category: "1.5MB+", value: 10 }
    ],
    ethereum: [
      { category: "0-100KB", value: 15 },
      { category: "100KB-300KB", value: 45 },
      { category: "300KB-500KB", value: 30 },
      { category: "500KB+", value: 10 }
    ],
    cardano: [
      { category: "0-50KB", value: 20 },
      { category: "50KB-150KB", value: 55 },
      { category: "150KB-250KB", value: 20 },
      { category: "250KB+", value: 5 }
    ],
    solana: [
      { category: "0-1MB", value: 10 },
      { category: "1MB-2MB", value: 25 },
      { category: "2MB-3MB", value: 40 },
      { category: "3MB+", value: 25 }
    ]
  };

  // Function to get explorer URL based on blockchain and transaction ID
  const getExplorerUrl = (blockchain, transactionId) => {
    switch(blockchain) {
      case 'bitcoin':
        return `https://www.blockchain.com/explorer/transactions/btc/${transactionId}`;
      case 'ethereum':
        return `https://etherscan.io/tx/${transactionId}`;
      case 'cardano':
        return `https://cardanoscan.io/transaction/${transactionId}`;
      case 'solana':
        return `https://solscan.io/tx/${transactionId}`;
      default:
        return '#';
    }
  };

  // Handle opening transaction in explorer
  const handleViewOnExplorer = () => {
    if (selectedTransaction) {
      const explorerUrl = getExplorerUrl(selectedBlockchain, selectedTransaction.id);
      window.open(explorerUrl, '_blank');
      showNotification(`Opening transaction in ${getBlockchainName(selectedBlockchain)} explorer`);
    }
  };

  // Fetch transaction data (simulated)
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // In a real implementation, this would call a blockchain API
      // For example: const response = await fetch(`https://api.blockchain.com/v3/${selectedBlockchain}/transactions?start=${dateRange.start}&end=${dateRange.end}`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Get the data for the selected blockchain
      setTransactions(blockchainData[selectedBlockchain] || []);
      setIsLoading(false);
    };
    
    fetchData();
  }, [selectedBlockchain, dateRange]);

  // Process grid data with sorting, paging
  const processedData = process(transactions, gridDataState);

  // Handle grid data state change
  const handleGridDataStateChange = (e) => {
    setGridDataState(e.dataState);
  };

  
  // Handle transaction selection
  const handleTransactionSelect = (event) => {
    setSelectedTransaction(event.dataItem);
    setTransactionDetailsOpen(true);
  };
  
  // Show notification
  const showNotification = (message) => {
    setNotificationMessage(message);
    setNotificationVisible(true);
    setTimeout(() => setNotificationVisible(false), 3000);
  };

  // Handle adding address to watchlist
  const handleAddressSubmit = (dataItem) => {
    setWatchedAddress(dataItem.address);
    showNotification(`Added ${dataItem.address} to watched addresses`);
  };

  // Tab selection handler
  const handleTabSelect = (e) => {
    setActiveTab(e.selected);
  };

  return (
    <div className="blockchain-visualizer">
      <h1>Blockchain Transaction Visualizer</h1>
      
      {/* Blockchain Selection and Date Range */}
      <div className="controls-panel">
        <div className="blockchain-selector">
          <Label>Blockchain Network</Label>
          <select 
            className="k-dropdown"
            value={selectedBlockchain}
            onChange={(e) => {
              const newValue = e.target.value;
              setSelectedBlockchain(newValue);
              
              // Get blockchain name from the select options
              const blockchainName = getBlockchainName(newValue);
              showNotification(`Switched to ${blockchainName} blockchain`);
            }}
          >
            {blockchainOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.text}
              </option>
            ))}
          </select>
        </div>
        
        <div className="date-range-picker">
          <div className="date-input">
            <Label>From</Label>
            <DatePicker
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.value})}
            />
          </div>
          <div className="date-input">
            <Label>To</Label>
            <DatePicker
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.value})}
            />
          </div>
          
          <Button
            primary={true}
            onClick={() => showNotification("Updated transaction data")}
          >
            Refresh Data
          </Button>
        </div>
      </div>
      
      {/* Main Content Tabs */}
      <TabStrip
        selected={activeTab}
        onSelect={handleTabSelect}
        className="main-tabs"
      >
        <TabStripTab title="Transaction Explorer">
          <Grid
            data={processedData}
            sortable={true}
            pageable={true}
            onRowClick={handleTransactionSelect}
            onDataStateChange={handleGridDataStateChange}
            {...gridDataState}
            loading={isLoading}
          >
            <GridColumn field="id" title="Transaction Hash" width="200px" />
            <GridColumn field="from" title="From" width="200px" />
            <GridColumn field="to" title="To" width="200px" />
            <GridColumn field="value" title="Value" width="120px" />
            <GridColumn field="timestamp" title="Time" width="180px" format="{0:yyyy-MM-dd HH:mm}" />
            <GridColumn field="confirmations" title="Confirmations" width="120px" />
          </Grid>
        </TabStripTab>
        
        <TabStripTab title="Transaction Metrics">
          <div className="chart-container">
            <h3>Transaction Analytics</h3>
            
            <div className="analytics-header">
              <div className="metric-card">
                <div className="metric-label">Daily Transactions</div>
                <div className="metric-value">{blockchainChartData[selectedBlockchain][6].count.toLocaleString()}</div>
                <div className={`trend-indicator ${blockchainChartData[selectedBlockchain][6].count > blockchainChartData[selectedBlockchain][5].count ? 'trend-up' : 'trend-down'}`}>
                  {blockchainChartData[selectedBlockchain][6].count > blockchainChartData[selectedBlockchain][5].count ? '+' : ''}
                  {(((blockchainChartData[selectedBlockchain][6].count - blockchainChartData[selectedBlockchain][5].count) / blockchainChartData[selectedBlockchain][5].count) * 100).toFixed(1)}%
                </div>
              </div>
              
              <div className="metric-card">
                <div className="metric-label">Transaction Volume</div>
                <div className="metric-value">{blockchainChartData[selectedBlockchain][6].value.toLocaleString()} {selectedBlockchain === 'bitcoin' ? 'BTC' : selectedBlockchain === 'ethereum' ? 'ETH' : selectedBlockchain === 'cardano' ? 'ADA' : 'SOL'}</div>
                <div className={`trend-indicator ${blockchainChartData[selectedBlockchain][6].value > blockchainChartData[selectedBlockchain][5].value ? 'trend-up' : 'trend-down'}`}>
                  {blockchainChartData[selectedBlockchain][6].value > blockchainChartData[selectedBlockchain][5].value ? '+' : ''}
                  {(((blockchainChartData[selectedBlockchain][6].value - blockchainChartData[selectedBlockchain][5].value) / blockchainChartData[selectedBlockchain][5].value) * 100).toFixed(1)}%
                </div>
              </div>
              
              <div className="metric-card">
                <div className="metric-label">Avg Transaction Size</div>
                <div className="metric-value">{(blockchainChartData[selectedBlockchain][6].value / blockchainChartData[selectedBlockchain][6].count).toFixed(3)}</div>
                <div className="trend-indicator">
                  {selectedBlockchain === 'bitcoin' ? 'BTC' : selectedBlockchain === 'ethereum' ? 'ETH' : selectedBlockchain === 'cardano' ? 'ADA' : 'SOL'}
                </div>
              </div>
            </div>
            
            <div className="data-grid-section">
              <h3>Weekly Transaction Trends</h3>
              <Grid
                data={blockchainChartData[selectedBlockchain]}
                sortable={true}
              >
                <GridColumn field="date" title="Date" width="100px" />
                <GridColumn field="count" title="Transactions" width="120px" format="{0:n0}" />
                <GridColumn field="value" title="Volume" width="120px" format="{0:n2}" />
                <GridColumn 
                  field="count" 
                  title="Daily Activity" 
                  width="250px"
                  cell={(props) => (
                    <td>
                      <div className="bar-chart">
                        <div 
                          className="bar-fill" 
                          style={{
                            width: `${(props.dataItem.count / Math.max(...blockchainChartData[selectedBlockchain].map(item => item.count)) * 100)}%`,
                            backgroundColor: "#FF9800"
                          }}
                        />
                        <div className="bar-value">{props.dataItem.count.toLocaleString()}</div>
                      </div>
                    </td>
                  )}
                />
              </Grid>
            </div>
          </div>
          
          <div className="chart-container">
            <h3>Block Size Distribution</h3>
            <div className="distribution-grid">
              {blockchainPieChartData[selectedBlockchain].map((item, index) => (
                <div 
                  key={item.category} 
                  className="distribution-item"
                  style={{ borderTopColor: `hsl(${210 + index * 30}, 80%, 55%)` }}
                >
                  <div className="distribution-label">{item.category}</div>
                  <div className="distribution-value">{item.value}%</div>
                  <div className="bar-chart">
                    <div 
                      className="bar-fill" 
                      style={{
                        width: `${item.value}%`,
                        backgroundColor: `hsl(${210 + index * 30}, 80%, 55%)`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="data-grid-section">
              <h3>Network Activity</h3>
              <div>
                <div className="bar-label">Transaction Distribution:</div>
                <div className="stacked-bars">
                  {[
                    { type: "Transfers", percent: selectedBlockchain === 'bitcoin' ? 65 : selectedBlockchain === 'ethereum' ? 45 : selectedBlockchain === 'cardano' ? 75 : 55, color: "#2196F3" },
                    { type: "Smart Contracts", percent: selectedBlockchain === 'bitcoin' ? 5 : selectedBlockchain === 'ethereum' ? 40 : selectedBlockchain === 'cardano' ? 15 : 35, color: "#FF9800" },
                    { type: "Other", percent: selectedBlockchain === 'bitcoin' ? 30 : selectedBlockchain === 'ethereum' ? 15 : selectedBlockchain === 'cardano' ? 10 : 10, color: "#9C27B0" }
                  ].map((segment, i) => (
                    <div 
                      key={i}
                      className="stacked-bar-segment segment-tooltip"
                      style={{ 
                        width: `${segment.percent}%`, 
                        backgroundColor: segment.color
                      }}
                      data-tooltip={`${segment.type}: ${segment.percent}%`}
                    >
                      {segment.percent > 8 ? `${segment.percent}%` : ''}
                    </div>
                  ))}
                </div>
              </div>
              
              <Grid
                style={{ marginTop: '20px' }}
                data={[
                  { 
                    type: "Transactions per Block", 
                    value: selectedBlockchain === 'bitcoin' ? "~2,500" : selectedBlockchain === 'ethereum' ? "~100" : selectedBlockchain === 'cardano' ? "~65,000" : "~3,000"
                  },
                  { 
                    type: "Block Time", 
                    value: selectedBlockchain === 'bitcoin' ? "10 minutes" : selectedBlockchain === 'ethereum' ? "12-14 seconds" : selectedBlockchain === 'cardano' ? "20 seconds" : "400ms"
                  },
                  { 
                    type: "Current TPS", 
                    value: selectedBlockchain === 'bitcoin' ? "~7" : selectedBlockchain === 'ethereum' ? "~15" : selectedBlockchain === 'cardano' ? "~250" : "~2,500"
                  }
                ]}
              >
                <GridColumn field="type" title="Network Metric" width="200px" />
                <GridColumn field="value" title="Value" width="150px" />
              </Grid>
            </div>
          </div>
        </TabStripTab>
        
        <TabStripTab title="Address Tracker">
          <Form
            onSubmit={handleAddressSubmit}
            render={(formRenderProps) => (
              <FormElement>
                <Field
                  id="address"
                  name="address"
                  label="Wallet Address"
                  component={Input}
                  validator={(value) => (!value ? "Address is required" : "")}
                />
                <Button
                  type="submit"
                  primary={true}
                  disabled={!formRenderProps.allowSubmit}
                  className="address-submit"
                >
                  Track Address
                </Button>
              </FormElement>
            )}
          />
          
          {watchedAddress && (
            <div className="address-details">
              <h3>Address: {watchedAddress}</h3>
              <div className="metrics-panel">
                <div className="metric">
                  <span className="metric-value">25.3421</span>
                  <span className="metric-label">Balance</span>
                </div>
                <div className="metric">
                  <span className="metric-value">142</span>
                  <span className="metric-label">Transactions</span>
                </div>
                <div className="metric">
                  <span className="metric-value">$12,542.87</span>
                  <span className="metric-label">USD Value</span>
                </div>
              </div>
              
              <div className="data-grid-section">
                <h3>Balance History</h3>
                      <Grid
                  data={[
                    { month: 'January', balance: 20.1 },
                    { month: 'February', balance: 22.5 },
                    { month: 'March', balance: 24.3 },
                    { month: 'April', balance: 23.8 },
                    { month: 'May', balance: 25.1 },
                    { month: 'June', balance: 25.3 }
                  ]}
                >
                  <GridColumn field="month" title="Month" width="120px" />
                  <GridColumn field="balance" title="Balance" width="120px" format="{0:n2}" />
                  <GridColumn 
                    field="balance" 
                    title="Visualization" 
                    width="250px"
                    cell={(props) => (
                      <td>
                        <div className="bar-chart">
                          <div 
                            className="bar-fill" 
                            style={{
                              width: `${(props.dataItem.balance / 26) * 100}%`,
                              backgroundColor: "#4CAF50"
                            }}
                          />
                          <div className="bar-value">{props.dataItem.balance.toFixed(2)}</div>
                        </div>
                      </td>
                    )}
                  />
                </Grid>
              </div>
            </div>
          )}
        </TabStripTab>
        
        <TabStripTab title="Learn Blockchain">
          <div className="education-panel">
            <h3>Blockchain Basics</h3>
            <p>
              A blockchain is a distributed database or ledger shared among computer network nodes.
              <Tooltip anchorElement="target" position="right">
                <span className="tooltip-target">What makes it special?</span>
                <div className="tooltip-content">
                  Blockchains are known for their role in cryptocurrency systems for maintaining a secure and decentralized record of transactions.
                </div>
              </Tooltip>
            </p>
            
            <h4>Key Concepts</h4>
            <ul>
              <li>
                <strong>Block</strong> - A collection of transactions bundled together
                <Tooltip anchorElement="target" position="right">
                  <span className="tooltip-target">Learn more</span>
                  <div className="tooltip-content">
                    Each block contains a cryptographic hash of the previous block, a timestamp, and transaction data.
                  </div>
                </Tooltip>
              </li>
              <li>
                <strong>Transaction</strong> - A transfer of value between blockchain addresses
              </li>
              <li>
                <strong>Consensus</strong> - The process by which all nodes agree on the blockchain state
              </li>
              <li>
                <strong>Mining</strong> - The process of creating new blocks through proof of work
              </li>
            </ul>
            
            <div className="blockchain-visual">
              <h4>Blockchain Structure</h4>
              <div className="blocks-container">
                {[1, 2, 3, 4].map((blockNum) => (
                  <div key={blockNum} className="block">
                    <div className="block-header">Block #{blockNum}</div>
                    <div className="block-content">
                      <div>Hash: 0x{Array(8).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}...</div>
                      <div>Prev: 0x{blockNum > 1 ? Array(8).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('') : '0000000000000000'}...</div>
                      <div>Txs: {5 + blockNum}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <h4>Blockchain Types</h4>
            <div className="blockchain-types">
              <div className="type-card">
                <h5>Public Blockchains</h5>
                <p>Open networks where anyone can participate, like Bitcoin and Ethereum.</p>
              </div>
              <div className="type-card">
                <h5>Private Blockchains</h5>
                <p>Restricted networks where only approved entities can participate.</p>
              </div>
              <div className="type-card">
                <h5>Hybrid Blockchains</h5>
                <p>Combination of public and private features for specific use cases.</p>
              </div>
            </div>
          </div>
        </TabStripTab>
      </TabStrip>
      
      {/* Transaction Details Dialog */}
      {selectedTransaction && transactionDetailsOpen && (
        <Dialog
          title="Transaction Details"
          onClose={() => setTransactionDetailsOpen(false)}
        >
          <div className="transaction-details">
            <h3>Transaction: {selectedTransaction.id}</h3>
            <p><strong>From:</strong> {selectedTransaction.from}</p>
            <p><strong>To:</strong> {selectedTransaction.to}</p>
            <p><strong>Value:</strong> {selectedTransaction.value} {selectedBlockchain === 'bitcoin' ? 'BTC' : selectedBlockchain === 'ethereum' ? 'ETH' : selectedBlockchain === 'cardano' ? 'ADA' : 'SOL'}</p>
            <p><strong>Time:</strong> {selectedTransaction.timestamp.toLocaleString()}</p>
            <p><strong>Confirmations:</strong> {selectedTransaction.confirmations}</p>
            
            <div className="confirmation-progress">
              <p>Confirmation Status:</p>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{width: `${Math.min(100, (selectedTransaction.confirmations / 6) * 100)}%`}}
                >
                </div>
              </div>
              <p>{selectedTransaction.confirmations >= 6 ? 'Fully Confirmed' : 'Awaiting Confirmations'}</p>
            </div>
          </div>
          <DialogActionsBar>
            <Button onClick={() => setTransactionDetailsOpen(false)}>Close</Button>
            <Button primary={true} onClick={handleViewOnExplorer}>View on Explorer</Button>
          </DialogActionsBar>
        </Dialog>
      )}
      
      {/* Notification Group */}
      <NotificationGroup
        style={{
          position: 'fixed',
          right: '10px',
          top: '10px',
        }}
      >
        {notificationVisible && (
          <Notification
            type={{ style: 'info', icon: true }}
            closable={true}
            onClose={() => setNotificationVisible(false)}
          >
            <span>{notificationMessage}</span>
          </Notification>
        )}
      </NotificationGroup>
    </div>
  );
};

export default BlockchainVisualizer;