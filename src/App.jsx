import React, { useEffect, useState } from "react";

const App = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTheData();
    // set a timeout to delay the application (optional)
  }, []); // dependencies

  async function fetchTheData() {
    try {
      setIsLoading(true);
      setError(null);

      // fetch api request to dynamo
      // use FETCH your API from a previous assignment on a hardcoded user
      const response = await fetch(
        "https://9ic4qmke47.execute-api.us-east-2.amazonaws.com/prod/reading?userid=srivant"
      );

      if (!response.ok) {
        throw new Error(`HTTPS fetch error! status: ${response.status}`);
      }

      const data = await response.json();
      // log result in the console
      console.log("API Result: ", data);

      // update the list of items
      // if your Lambda returns { Items: [...] }, use setItems(data.Items || []);
      setItems(data);
    } catch (err) {
      // error state
      console.error("Fetch error:", err);
      setError(err.message || "Error Fetching Data");
    } finally {
      // is loading state here, unconditionally
      setIsLoading(false);
    }
  }

  // if there is an error or isLoading, render the appropriate message
  if (isLoading) {
    return <div>Loading data from the database ...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="app-container">
      <h3>Reading the Database</h3>

      <ul>
        {items.map((item) => (
          <li key={item.id}>{item.text}</li>
        ))}
      </ul>
    </div>
  );
};

export default App;