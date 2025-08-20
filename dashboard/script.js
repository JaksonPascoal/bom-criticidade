// script.js

document.addEventListener('DOMContentLoaded', function() {
    fetch('./data/criticality_data.json')
        .then(response => response.json())
        .then(data => {
            const labels = data.map(item => item.criticality_level);
            const dataValues = data.map(item => item.number_of_materials);

            const ctx = document.getElementById('criticalityChart').getContext('2d');
            const criticalityChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Número de Materiais por Nível de Criticidade',
                        data: dataValues,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.6)', // Alta (vermelho)
                            'rgba(54, 162, 235, 0.6)',  // Baixa (azul)
                            'rgba(255, 206, 86, 0.6)'   // Media (amarelo)
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        })
        .catch(error => console.error('Erro ao carregar o JSON:', error));
});