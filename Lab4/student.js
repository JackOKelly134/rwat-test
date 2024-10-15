document.addEventListener('DOMContentLoaded', function() {
    const dataDisplay = document.getElementById('dataDisplay');
    //let allData = [];

    function clearDisplay() {
        dataDisplay.innerHTML = '';
    }

    function processData(data) {
        return data.map(entry => {
            const [firstname, surname] = entry.split(' ');
            return {
                firstname: firstname,
                surname: surname,
                id: entry.id
            };
        });
    }

    function renderTable(data) {
        let tableHTML = '<table border="1"><tr><th>First Name</th><th>Surname</th><th>ID</th></tr>';
        data.forEach(entry => {
            tableHTML += ` <tr>
                <td>${entry.firstname}</td>
                <td>${entry.surname}</td>
                <td>${entry.id}</td>
            </tr>`;
        });
        tableHTML += '</table>';
        dataDisplay.innerHTML = tableHTML;
    }

    // Synchronously
    function syncXMLHttpRequest() {
        clearDisplay();
        let allData = [];
    

        function fetchsync(file) {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', file, false);
            xhr.send(null);
            if (xhr.status === 200) {
                return JSON.parse(xhr.responseText);
            }else {
                console.error(' Fetching Error ${file}: ${xhr.statusText}');
            }
        }

        const referenceData = fetchsync('data/ref.json');
        const data1 = fetchsync('data/{$referenceData.data_location}');
        allData = allData.concat(processData(data1.data));
        
        const data2 = fetchsync('data/{$data1.data_location}');
        allData = allData.concat(processData(data2.data));

        const data3 = fetchsync('data/data3.json}');
        allData = allData.concat(processData(data3.data));

        renderTable(allData);
    }

    //Asynchronously
    function asyncXMLHttpRequest() {
        clearDisplay();
        let allData = [];

        function fetchasync(file, callback) {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', file, true);
            xhr.onload = function() {
                if (xhr.status === 200) {
                    const data = JSON.parse(xhr.responseText);
                    callback(null, data);
                }else {
                    console.error(' Fetching Error ${file}: ${xhr.statusText}',null);
                }
            };

            xhr.onerror = function() {
                console.error(' Network Error ${file}',null);
            };
            xhr.send();
        }

        fetchasync('data/ref.json}', function(err, referenceData){
            if (err) {
                console.error(err)
                return;
            }
           

            fetchasync('data/{$referenceData.data_location}', function(err, data1){
                if (err) {
                    console.error(err)
                    return;
                }
                allData = allData.concat(processData(data1.data));

                fetchasync('data/${data1.data_location}', function(err, data2){

                    if (err) {
                        console.error(err)
                        return;
                    }
                    allData = allData.concat(processData(data2.data));

                    fetchasync('data/data3.json', function(err, data3){
                        if (err) {
                
                            console.error(err)
                            return;
                        }
                        allData = allData.concat(processData(data3.data));

                        renderTable(allData);
                    });
                });
            });
        });   

    }

    //Fetch
    function fetch() {
        clearDisplay();
        let allData = [];
        
        function fetchData(file) {
            return fetch(file).then(response => {
                if (!response.ok) {
                    throw new Error('Error ${file}: ${response.statusText}');
                }
                return response.json();
            });
        }

        fetchData('data/ref.json')
            .then(referenceData => {
                return fetchData('data/${referenceData.data_location}');
            })

            .then(data1 => {
                allData = allData.concat(processData(data1.data));
    
                return fetchData('data/${data1.data_location}');
            })
    
            .then(data2 => {
                allData = allData.concat(processData(data2.data));
    
                return fetchData('data/data3.json');
            })
    
            .then(data3 => {
                allData = allData.concat(processData(data3.data));
    
                renderTable(allData);
            })
            
            .catch(error => {
                console.error("Error can't fetch data:", error);
            });

        

    }

    document.getElementById('syncButton').addEventListener('click', syncXMLHttpRequest);
    document.getElementById('asyncButton').addEventListener('click', asyncXMLHttpRequest);
    document.getElementById('fetchButton').addEventListener('click', fetch);
});


