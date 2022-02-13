import React, { useEffect, useRef, useState } from "react";
import './App.css';
import { w3cwebsocket as W3CWebSocket } from "websocket";
import ChartContainer from "./components/ChartContainer";

const client = new W3CWebSocket('ws://ws-sandbox.coinapi.io/v1/');
const API_KEY = process.env.REACT_APP_API_KEY;

const App = () => {
    const [inputValue, setInputValue] = useState('');
    const [data, setData] = useState({
        idBase: '',
        idQuote: '',
        price: '',
        time: '',
    });
    const [chartData, setChartData] = useState(null);

    const receiveMessage = async (msg) => {
        const parsedData = JSON.parse(msg.data);

        if (!parsedData?.rate) return;

        setData({
            idBase: parsedData.asset_id_base,
            idQuote: parsedData.asset_id_quote,
            price: parsedData.rate.toFixed(3),
            time: new Date(parsedData.time).toUTCString(),
        });
    }

    useEffect(() => {
        client.addEventListener('open', () => {
            console.log('Client connected');
        });

        client.addEventListener('message', receiveMessage);

        client.addEventListener('close', () => {
            console.log('Client disconnected');
        })
    }, []);

    const sendRequest = async () => {
        if (!inputValue && !inputValue.includes('/')) return;

        setData({
            idBase: '',
            idQuote: '',
            price: '',
            time: '',
        });

        const dataToSend = JSON.stringify({
            "type": "hello",
            "apikey": API_KEY,
            "heartbeat": false,
            "subscribe_data_type": ["exrate"],
            "subscribe_filter_asset_id": [inputValue]
        });

        client.send(dataToSend);

        const splitValue = inputValue.split('/');
        const url = `https://rest.coinapi.io/v1/exchangerate/${splitValue[0].toUpperCase()}/${splitValue[1].toUpperCase()}/history?period_id=10DAY&limit=100&time_end=${new Date().toISOString()}`;

        const response = await fetch(url, {
            "method": "GET",
            "headers": {'X-CoinAPI-Key': API_KEY},
        });

        const data = await response.json();

        setChartData(data);
    }

    return (
        <div className="App">
            <div className="container">
                <div className="input">
                    <input
                        type="text"
                        placeholder="BTC/USD"
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                    <button onClick={sendRequest}>Subscribe</button>
                </div>
                <div style={{
                    margin: '15px 5px',
                }}>Market Data:</div>
                <div className="market-data">
                    <div className="field">
                        <div>Symbol:</div>
                        <div>{`${data.idBase}${data.idBase && '/'}${data.idQuote}`}</div>
                    </div>
                    <div className="field">
                        <div>Price:</div>
                        <div>{data.price} {data.idQuote}</div>
                    </div>
                    <div className="field">
                        <div>Time:</div>
                        <div>{data.time}</div>
                    </div>
                </div>
                <div style={{
                    margin: '15px 5px',
                }}>Charting Data:</div>
                <ChartContainer
                    data={chartData}
                    currency={inputValue?.split('/')[1]}
                />
            </div>
        </div>
    );
}

export default App;
