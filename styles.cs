body {
    font-family: 'Arial', sans-serif;
    background-color: #f4f4f4;
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}

.container {
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 90%;
    max-width: 800px;
    padding: 20px;
}

h1 {
    text-align: center;
    color: #333;
    margin-bottom: 20px;
}

#data-container {
    overflow-x: auto;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 15px;
}

table, th, td {
    border: 1px solid #ddd;
}

th {
    background-color: #f2f2f2;
    padding: 10px;
    text-align: left;
}

td {
    padding: 10px;
}

tr:nth-child(even) {
    background-color: #f9f9f9;
}