import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './QuoteOfTheDay.css';

const QuoteOfTheDay = () => {
    const [quote, setQuote] = useState({ content: '', author: '' });

    useEffect(() => {
        const fetchQuote = async () => {
            try {
                const response = await axios.get('https://api.quotable.io/random');
                setQuote({
                    content: response.data.content,
                    author: response.data.author,
                });
            } catch (error) {
                console.error("Error fetching the quote", error);
                setQuote({
                    content: "The only way to do great work is to love what you do.",
                    author: "Steve Jobs"
                });
            }
        };

        fetchQuote();
    }, []);

    return (
        <div className="quote-container">
            <p className="quote-content">"{quote.content}"</p>
            <p className="quote-author">- {quote.author}</p>
        </div>
    );
};

export default QuoteOfTheDay;
