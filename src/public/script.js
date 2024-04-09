let books = [];

// Function to fetch books from the backend and display them in the table
async function fetchAndDisplayBooks() {
    try {
        const response = await fetch('/api/books');
        if (!response.ok) {
            throw new Error('Failed to fetch books');
        }
        books = await response.json();
        displayBooks(books);
    } catch (error) {
        console.error('Error fetching books:', error);
        alert('An error occurred while fetching books');
    }
}

// Function to display books in table
function displayBooks(books) {
    const tableBody = document.getElementById('bookTableBody');
    tableBody.innerHTML = '';
    books.forEach(book => {
        const row = `<tr>
                        <td>${book.title}</td>
                        <td>${book.author}</td>
                        <td>${book.genre}</td>
                        <td>${book.year}</td>
                        <td><input type="checkbox" id="selectBook_${book.id}"></td>
                    </tr>`;
        tableBody.innerHTML += row;
    });
}

// Function to filter books by genre
function filterBooks() {
    const genreFilter = document.getElementById('genreFilter').value;
    if (genreFilter === '') {
        displayBooks(books); // If no filter selected, display all books
    } else {
        const filteredBooks = books.filter(book => book.genre === genreFilter);
        displayBooks(filteredBooks); // Display only books matching the selected genre
    }
}

// Function to switch between login and registration forms
function showRegistrationForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registrationForm').style.display = 'block';
}

function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registrationForm').style.display = 'none';
}

async function searchBooks() {
    try {
        const searchInput = document.getElementById('searchInput').value.trim();
        const response = await fetch(`/api/books?search=${searchInput}`);
        if (!response.ok) {
            throw new Error('Failed to fetch search results');
        }
        const searchResults = await response.json();
        displayBooks(searchResults); // Display search results
    } catch (error) {
        console.error('Error searching books:', error);
        // Handle error appropriately
    }
}


// Function to show add book form
function showAddBookForm() {
    document.getElementById('bookCatalog').style.display = 'none';
    document.getElementById('addUpdateBookForm').style.display = 'block';
    document.getElementById('formTitle').innerText = 'Add Book';
    document.getElementById('submitBtn').innerText = 'Add Book';
}

// Function to add or update book
async function addOrUpdateBook() {
    const title = document.getElementById('bookTitle').value.trim();
    const author = document.getElementById('bookAuthor').value.trim();
    const genre = document.getElementById('bookGenre').value.trim();
    const year = parseInt(document.getElementById('bookYear').value.trim());

    if (!title || !author || !genre || isNaN(year)) {
        alert('Please fill in all fields with valid data.');
        return;
    }

    try {
        const response = await fetch('/api/books', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, author, genre, year })
        });

        if (response.ok) {
            alert('Book added successfully');
            await fetchAndDisplayBooks(); // Reload books after addition
            // Clear input fields after successful addition
            document.getElementById('bookTitle').value = '';
            document.getElementById('bookAuthor').value = '';
            document.getElementById('bookGenre').value = '';
            document.getElementById('bookYear').value = '';
        } else {
            alert('Failed to add book');
        }
    } catch (error) {
        console.error('Error adding book:', error);
        alert('An error occurred while adding the book');
    }
}


// Function to cancel add/update book form
function cancelForm() {
    document.getElementById('addUpdateBookForm').style.display = 'none';
    document.getElementById('bookCatalog').style.display = 'block';
    document.getElementById('bookTitle').value = '';
    document.getElementById('bookAuthor').value = '';
    document.getElementById('bookGenre').value = '';
    document.getElementById('bookYear').value = '';
}

// Function to delete selected books
async function deleteSelectedBooks() {
    const selectedBooks = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(checkbox => parseInt(checkbox.id.split('_')[1]));
    if (selectedBooks.length === 0) {
        alert('Please select at least one book to delete.');
        return;
    }

    try {
        const response = await fetch('/api/books', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ids: selectedBooks }) // Send selected book IDs in the request body
        });

        if (!response.ok) {
            throw new Error('Failed to delete selected books');
        }

        // If deletion is successful, update the local books array and display updated list of books
        books = books.filter(book => !selectedBooks.includes(book.id));
        displayBooks(books);
    } catch (error) {
        console.error('Error deleting books:', error);
        alert('An error occurred while deleting books');
    }
}

async function login() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            document.getElementById('mainContainer').style.display = 'none';
            document.getElementById('bookCatalog').style.display = 'block';
            document.getElementById('recommendations').style.display = 'block';
            generateRecommendations();
        } else {
            alert('Invalid username or password. Please try again.');
        }
    } catch (error) {
        console.error('Error logging in:', error);
        alert('An error occurred while logging in');
    }
}

async function register() {
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value.trim();
    const email = document.getElementById('registerEmail').value.trim();

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password, email })
        });

        if (response.ok) {
            document.getElementById('mainContainer').style.display = 'none';
            document.getElementById('bookCatalog').style.display = 'block';
            document.getElementById('recommendations').style.display = 'block';
            generateRecommendations();
        } else {
            alert('Registration failed. Please try again.');
        }
    } catch (error) {
        console.error('Error registering:', error);
        alert('An error occurred while registering');
    }
}

// Function to generate recommended books
function generateRecommendations() {
    const recommendedBooksDiv = document.getElementById('recommendedBooks');
    recommendedBooksDiv.innerHTML = ''; // Clear previous recommendations
    // Generate and display recommended books (dummy data for demonstration)
    const recommendedBooks = [
        { title: "Recommended Book 1", author: "Recommended Author 1", genre: "Fiction", year: 2000 },
        { title: "Recommended Book 2", author: "Recommended Author 2", genre: "Fantasy", year: 2005 },
        { title: "Recommended Book 3", author: "Recommended Author 3", genre: "Science Fiction", year: 2010 }
    ];
    recommendedBooks.forEach(book => {
        const p = document.createElement('p');
        p.textContent = `${book.title} by ${book.author}`;
        recommendedBooksDiv.appendChild(p);
    });
}

// Function to display book details modal
function displayBookDetails(bookId) {
    const book = books.find(b => b.id === bookId);
    if (!book) {
        console.error('Book not found');
        return;
    }
    document.getElementById('modalTitle').textContent = book.title;
    document.getElementById('modalAuthor').textContent = `Author: ${book.author}`;
    document.getElementById('modalGenre').textContent = `Genre: ${book.genre}`;
    document.getElementById('modalYear').textContent = `Year: ${book.year}`;
    document.getElementById('bookDetailsModal').style.display = 'block';
}

// Function to close book details modal
function closeModal() {
    document.getElementById('bookDetailsModal').style.display = 'none';
}

// Dummy function to log out
function logout() {
    // Dummy logout functionality
    // Here, you would clear the session and redirect to the login page
    document.getElementById('mainContainer').style.display = 'block';
    document.getElementById('bookCatalog').style.display = 'none';
    document.getElementById('recommendations').style.display = 'none';
}

// Initially display all books
fetchAndDisplayBooks();
