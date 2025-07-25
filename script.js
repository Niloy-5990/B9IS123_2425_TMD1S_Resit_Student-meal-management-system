document.addEventListener('DOMContentLoaded', () => {
    const breakfastMenu = document.getElementById('breakfast');
    const lunchMenu = document.getElementById('lunch');
    const dinnerMenu = document.getElementById('dinner');
    const additionalMealsDropdown = document.getElementById('additional-meals');
    const additionalMealList = document.getElementById('additional-meal-list');
    const totalPriceEl = document.getElementById('total-price');
    const selectedItemsContainer = document.getElementById('selected-items');
    const receiptDetailsContainer = document.getElementById('receipt-details');
    const modal = document.getElementById('modal');
    const closeModal = document.getElementById('close-modal');
    const modalReceiptDetails = document.getElementById('modal-receipt-details');
    const confirmOrderButton = document.getElementById('confirm-order');
    const generateReceiptButton = document.getElementById('generate-receipt');
    const cancelOrderButton = document.getElementById('cancel-order');
    const ordersList = document.getElementById('orders-list');

    // Fetch meals from the backend
    function fetchMeals() {
        fetch('/api/meals')
            .then(response => response.json())
            .then(data => {
                populateDropdown(breakfastMenu, data.filter(meal => meal.type === 'breakfast'));
                populateDropdown(lunchMenu, data.filter(meal => meal.type === 'lunch'));
                populateDropdown(dinnerMenu, data.filter(meal => meal.type === 'dinner'));
                populateDropdown(additionalMealsDropdown, data.filter(meal => meal.type === 'additional'));
            })
            .catch(err => console.error('Error fetching meals:', err));
    }

    // Populate dropdowns with meals
    function populateDropdown(dropdown, meals) {
        if (!dropdown) return;
        dropdown.innerHTML = '<option value="">--Select--</option>';
        meals.forEach(meal => {
            const option = document.createElement('option');
            option.value = meal.price;
            option.textContent = `${meal.name} - $${meal.price.toFixed(2)}`;
            dropdown.appendChild(option);
        });
    }

    // Ensure consistent class name for additional meals
    function addAdditionalMeal() {
        const selectedOption = additionalMealsDropdown.options[additionalMealsDropdown.selectedIndex];
        if (!selectedOption || !selectedOption.value) return;

        const mealContainer = document.createElement('div');
        mealContainer.className = 'additional-meal-item'; // Fixed class name
        mealContainer.innerHTML = `
            <span>${selectedOption.textContent}</span>
            <button class="remove-meal">Remove</button>
        `;

        mealContainer.querySelector('.remove-meal').addEventListener('click', () => {
            mealContainer.remove();
            updateOrderSummary();
        });

        additionalMealList.appendChild(mealContainer);
        updateOrderSummary();
    }

    // Update order summary with additional meals
    function updateOrderSummary() {
        selectedItemsContainer.innerHTML = ''; // Clear existing items

        const selectedMeals = [
            { menu: breakfastMenu, type: 'Breakfast' },
            { menu: lunchMenu, type: 'Lunch' },
            { menu: dinnerMenu, type: 'Dinner' }
        ];

        selectedMeals.forEach(({ menu, type }) => {
            const selectedOption = menu.options[menu.selectedIndex];
            if (selectedOption && selectedOption.value) {
                const item = document.createElement('div');
                item.className = 'meal-item';
                item.innerHTML = `
                    <span class="meal-name">${selectedOption.textContent}</span>
                    <span class="meal-type">${type}</span>
                    <span class="meal-price">$${parseFloat(selectedOption.value).toFixed(2)}</span>
                    <button class="remove-meal">Remove</button>
                `;

                item.querySelector('.remove-meal').addEventListener('click', () => {
                    menu.selectedIndex = 0; // Reset the dropdown
                    updateOrderSummary();
                });

                selectedItemsContainer.appendChild(item);
            }
        });

        // Additional meals
        Array.from(additionalMealList.querySelectorAll('.additional-meal-item')).forEach(mealItem => {
            const mealSpan = mealItem.querySelector('span');
            const item = document.createElement('div');
            item.className = 'selected-item';
            item.innerHTML = `
                <strong>Additional:</strong> ${mealSpan.textContent}
                <button class="remove-meal">Remove</button>
            `;

            item.querySelector('.remove-meal').addEventListener('click', () => {
                mealItem.remove();
                updateOrderSummary();
            });

            selectedItemsContainer.appendChild(item);
        });

        updatePrices();
    }

    // Calculate and update total price
    function updatePrices() {
        const mainMealPrice = [
            parseFloat(breakfastMenu.value) || 0,
            parseFloat(lunchMenu.value) || 0,
            parseFloat(dinnerMenu.value) || 0
        ].reduce((sum, price) => sum + price, 0);

        const additionalMealPrices = Array.from(additionalMealList.querySelectorAll('.additional-meal-item span'))
            .map(mealSpan => parseFloat(mealSpan.textContent.split('$')[1]) || 0)
            .reduce((sum, price) => sum + price, 0);

        const totalPrice = mainMealPrice + additionalMealPrices;
        totalPriceEl.textContent = `Total Price: $${totalPrice.toFixed(2)}`;
    }

    // Generate receipt and add meal to database
    function generateReceipt() {
        const selectedMeals = [
            { menu: breakfastMenu, type: 'Breakfast' },
            { menu: lunchMenu, type: 'Lunch' },
            { menu: dinnerMenu, type: 'Dinner' }
        ].map(({ menu, type }) => {
            const selectedOption = menu.options[menu.selectedIndex];
            return selectedOption && selectedOption.value
                ? { type, name: selectedOption.textContent.split(' - ')[0], price: parseFloat(selectedOption.value) }
                : null;
        }).filter(meal => meal !== null);

        // Additional meals
        Array.from(additionalMealList.querySelectorAll('.additional-meal-item')).forEach(mealItem => {
            const mealName = mealItem.querySelector('span').textContent;
            const mealPrice = parseFloat(mealItem.querySelector('span').textContent.split('$')[1]) || 0;
            selectedMeals.push({ type: 'Additional', name: mealName, price: mealPrice });
        });

        const totalPrice = parseFloat(totalPriceEl.textContent.split('$')[1]);
        const receiptId = `R-${Date.now()}`; // Generate a unique receipt ID

        // Simulate adding to database
        console.log('Adding to database:', { receiptId, meals: selectedMeals, totalPrice });

        // Display receipt details
        receiptDetailsContainer.innerHTML = `
            <h3>Receipt ID: ${receiptId}</h3>
            <ul>
                ${selectedMeals.map(meal => `<li>${meal.type}: ${meal.name} - $${meal.price.toFixed(2)}</li>`).join('')}
            </ul>
            <p><strong>Total Price:</strong> $${totalPrice.toFixed(2)}</p>
        `;

        // Display meal card for update/delete
        displayMealCard(receiptId, selectedMeals, totalPrice);
    }

    // Display meal card
    function displayMealCard(receiptId, meals, totalPrice) {
        const card = document.createElement('div');
        card.className = 'meal-card';
        card.innerHTML = `
            <h3>Receipt ID: ${receiptId}</h3>
            <ul>
                ${meals.map(meal => `<li>${meal.type}: ${meal.name} - $${meal.price.toFixed(2)}</li>`).join('')}
            </ul>
            <p><strong>Total Price:</strong> $${totalPrice.toFixed(2)}</p>
            <button class="update-meal">Update</button>
            <button class="delete-meal">Delete</button>
        `;

        // Add event listeners for update and delete
        card.querySelector('.update-meal').addEventListener('click', () => {
            alert('Update functionality not implemented yet.');
        });

        card.querySelector('.delete-meal').addEventListener('click', () => {
            card.remove();
            alert('Meal deleted successfully.');
        });

        document.body.appendChild(card);
    }

    // Generate unique receipt ID
    function generateReceiptId() {
        return `REC-${Date.now()}`;
    }

    // Show modal with receipt preview
    function showReceiptPreview() {
        if (!validateSelections()) {
            alert('Please complete your meal selections before generating a receipt.');
            return;
        }

        const receiptId = generateReceiptId();
        modalReceiptDetails.innerHTML = `
            <p><strong>Receipt ID:</strong> ${receiptId}</p>
            ${selectedItemsContainer.innerHTML}
        `; // Copy order summary to modal with receipt ID
        modal.style.display = 'block';
    }

    // Validate meal selections
    function validateSelections() {
        return (
            breakfastMenu.value ||
            lunchMenu.value ||
            dinnerMenu.value ||
            additionalMealList.querySelectorAll('.additional-meal-item').length > 0
        );
    }

    // Close modal
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Close modal on cancel
    cancelOrderButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Confirm order and display it
    confirmOrderButton.addEventListener('click', () => {
        const receiptId = generateReceiptId();
        const timestamp = new Date().toISOString();
        const totalPrice = parseFloat(totalPriceEl.textContent.replace('Total Price: $', ''));

        // Collect selected main meal details
        const mainMeals = [
            { menu: breakfastMenu, type: 'Breakfast' },
            { menu: lunchMenu, type: 'Lunch' },
            { menu: dinnerMenu, type: 'Dinner' }
        ].map(({ menu, type }) => {
            const selectedOption = menu.options[menu.selectedIndex];
            if (selectedOption && selectedOption.value) {
                return {
                    name: selectedOption.textContent.split(' - ')[0],
                    type,
                    price: parseFloat(selectedOption.value)
                };
            }
            return null;
        }).filter(meal => meal !== null);

        // Collect additional meal details
        const additionalMeals = Array.from(additionalMealList.querySelectorAll('.additional-meal-item')).map(item => {
            const mealSpan = item.querySelector('span');
            const mealName = mealSpan.textContent.split(' - ')[0];
            const mealPrice = parseFloat(mealSpan.textContent.split('$')[1]) || 0;
            return {
                name: mealName,
                type: 'Additional',
                price: mealPrice
            };
        });

        // Combine main meals and additional meals
        const orders = [...mainMeals, ...additionalMeals];

        console.log('Constructed orders array:', orders); // Debugging log

        const orderDetails = {
            receiptId,
            timestamp,
            totalPrice,
            orders // Include orders in the request body
        };

        console.log('Order details being sent to backend:', orderDetails); // Debugging log

        // Send order details to the backend
        fetch('/api/receipts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderDetails)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to create receipt');
            }
            return response.json();
        })
        .then(data => {
            alert(`Order confirmed! Receipt ID: ${data.receiptNumber}`);
            queryOrdersTable(); // Query the orders table after confirmation
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to confirm order. Please try again.');
        });

        modal.style.display = 'none';
    });

    // Query the orders table and display in Confirm Orders card
    function queryOrdersTable() {
        fetch('/api/orders')
            .then(response => response.json())
            .then(data => {
                ordersList.innerHTML = ''; // Clear existing orders
                data.forEach(order => {
                    const orderContainer = document.createElement('div');
                    orderContainer.className = 'order-item';
                    orderContainer.innerHTML = `
                        <p><strong>Receipt ID:</strong> ${order.receiptId}</p>
                        <p><strong>Timestamp:</strong> ${order.timestamp}</p>
                        <ul>
                            ${order.orders.map(meal => `<li>${meal.type}: ${meal.name} - $${meal.price.toFixed(2)}</li>`).join('')}
                        </ul>
                        <p><strong>Total Price:</strong> $${order.totalPrice.toFixed(2)}</p>
                        <button class="update-order">Update</button>
                        <button class="delete-order">Delete</button>
                    `;

                    // Add event listener for Update button
                    orderContainer.querySelector('.update-order').addEventListener('click', () => {
                        const updatedOrders = prompt('Enter updated orders as JSON:', JSON.stringify(order.orders));
                        if (updatedOrders) {
                            try {
                                const parsedOrders = JSON.parse(updatedOrders);
                                fetch(`/api/orders/${order.receiptId}`, {
                                    method: 'PUT',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ orders: parsedOrders })
                                })
                                    .then(response => {
                                        if (!response.ok) {
                                            throw new Error('Failed to update orders');
                                        }
                                        return response.json();
                                    })
                                    .then(data => {
                                        alert(data.message);
                                        queryOrdersTable(); // Refresh the orders list
                                    })
                                    .catch(err => {
                                        console.error('Error updating orders:', err);
                                        alert('Failed to update orders.');
                                    });
                            } catch (err) {
                                alert('Invalid JSON format. Please try again.');
                            }
                        }
                    });

                    // Add event listener for Delete button
                    orderContainer.querySelector('.delete-order').addEventListener('click', () => {
                        if (confirm(`Are you sure you want to delete receipt ${order.receiptId}?`)) {
                            fetch(`/api/receipts/${order.receiptId}`, {
                                method: 'DELETE'
                            })
                                .then(response => {
                                    if (!response.ok) {
                                        throw new Error('Failed to delete receipt');
                                    }
                                    return response.json();
                            })
                                .then(data => {
                                    alert(data.message);
                                    queryOrdersTable(); // Refresh the orders list
                            })
                                .catch(err => {
                                    console.error('Error deleting receipt:', err);
                                    alert('Failed to delete receipt.');
                                });
                        }
                    });

                    ordersList.appendChild(orderContainer);
                });
            })
            .catch(err => console.error('Error fetching orders:', err));
    }

    // Display an order as a receipt
    function displayOrder(order) {
        const orderContainer = document.createElement('div');
        orderContainer.className = 'receipt';
        orderContainer.setAttribute('data-id', order.id);
        orderContainer.innerHTML = `
            <p><strong>Receipt ID:</strong> ${order.id}</p>
            <p><strong>Timestamp:</strong> ${order.timestamp}</p>
            <div class="order-details">${order.details}</div>
            <button class="update-order">Update</button>
            <button class="delete-order">Delete</button>
        `;

        // Hide 'Remove' buttons inside meal boxes by default
        const removeButtons = orderContainer.querySelectorAll('.remove-meal');
        removeButtons.forEach(button => {
            button.style.display = 'none';
        });

        // Add event listeners for update and delete
        orderContainer.querySelector('.update-order').addEventListener('click', () => {
            enableEditing(orderContainer);
        });

        orderContainer.querySelector('.delete-order').addEventListener('click', () => {
            orderContainer.remove();
            alert('Order deleted!');
        });

        ordersList.appendChild(orderContainer);
    }

    // Enable editing for an order
    function enableEditing(orderContainer) {
        const orderDetails = orderContainer.querySelector('.order-details');
        const updateButton = orderContainer.querySelector('.update-order');

        // Redirect to meal selection
        loadOrderIntoMealSelection(orderDetails.innerHTML);

        // Remove the order temporarily
        orderContainer.remove();

        alert('Edit the order in the meal selection section and confirm again to save changes.');
    }

    // Load order details into meal selection
    function loadOrderIntoMealSelection(orderDetailsHTML) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(orderDetailsHTML, 'text/html');

        // Example: Populate dropdowns based on the order details
        const selectedMeals = doc.querySelectorAll('.selected-item');
        selectedMeals.forEach(item => {
            const type = item.querySelector('strong').textContent.replace(':', '').toLowerCase();
            const dropdown = document.getElementById(type);
            if (dropdown) {
                const mealText = item.textContent.split('-')[0].trim();
                const option = Array.from(dropdown.options).find(opt => opt.textContent.includes(mealText));
                if (option) {
                    dropdown.value = option.value;
                }
            }
        });

        // Trigger recalculation of total price
        updateOrderSummary();
    }

    // Add event listeners to main menus
    [breakfastMenu, lunchMenu, dinnerMenu].forEach(menu => {
        menu.addEventListener('change', updateOrderSummary);
    });

    // Attach receipt preview to generate receipt button
    generateReceiptButton.addEventListener('click', showReceiptPreview);

    // Add event listener for adding additional meals
    document.getElementById('add-additional-meal').addEventListener('click', addAdditionalMeal);

    // Initialize the app
    fetchMeals();
});

