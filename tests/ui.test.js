const { test, expect } = require('@playwright/test');

const homeUrl = 'http://localhost:3000';
const loginUrl = 'http://localhost:3000/login';
const registerUrl = 'http://localhost:3000/register';
const catalogUrl = 'http://localhost:3000/catalog';
const validEmail = 'peter@abv.bg';
const validPass = '123456';

const randomDigits = Math.floor(1000 + Math.random() * 9000);
const newTestRegister = `test${randomDigits}@abv.bg`;

async function login(page) {
    await page.fill('input[name="email"]', validEmail);
    await page.fill('input[name="password"]', validPass);
    await page.click('input[type="submit"]');
}

async function submitAndLogin(page) {
    await page.click('input[type="submit"]');

    await page.fill('input[name="email"]', validEmail);
    await page.fill('input[name="password"]', validPass);
}

//1
test('Verify "All Books" link is visible', async ({ page }) =>{
    await page.goto(homeUrl);
    await page.waitForSelector('nav.navbar');

    const allBooksLinks = await page.$('a[href="/catalog"]');
    const isLinkVisible = await allBooksLinks.isVisible();

    expect(isLinkVisible).toBe(true);
});

//2
test('Verify "Login" button is visible', async ({ page }) =>{
    await page.goto(homeUrl);
    await page.waitForSelector('nav.navbar');

    const loginButton = await page.$('a[href="/login"]');
    const isLoginButtonVisible = await loginButton.isVisible();

    expect(isLoginButtonVisible).toBe(true);
});

//3
test('Verify "All Books" link is visible after user login', async ({ page }) =>{
    await page.goto(loginUrl);
    await page.waitForSelector('nav.navbar');

    await login(page);

    const allBooksLink = await page.$('a[href="/catalog"]');
    const isAllBookVisible = await allBooksLink.isVisible();

    expect(isAllBookVisible).toBe(true);
});

//4
test('Login with valid credentials', async ({ page }) =>{
    await page.goto(loginUrl);

    await login(page);

    await page.$('a[href="/catalog"]');
   
    expect(page.url()).toBe(catalogUrl);
});

//5
test('Submit the form with empty fields', async ({ page }) =>{
    await page.goto(loginUrl);
    await page.click('input[type="submit"]');

   page.on('dialog', async dialog => {
    expect(dialog.type()).toContain('alert');
    expect(dialog.message()).toContain('All fields are required!');
    await dialog.accept();
   })
    await page.$('a[href="/login"]');   
    expect(page.url()).toBe(loginUrl);
});

//6
test('Register with valid credentials', async ({ page }) =>{
    await page.goto(registerUrl);

    await page.fill('input[name="email"]', newTestRegister);
    await page.fill('input[name="password"]', validPass);
    await page.fill('input[name="confirm-pass"]', validPass);
    await page.click('input[type="submit"]');

    await page.$('a[href="/catalog"]');
   
    expect(page.url()).toBe(catalogUrl);
});

//7
test('Submit the register form with empty fields', async ({ page }) =>{
    await page.goto(registerUrl);
    await page.click('input[type="submit"]');

    page.on('dialog', async dialog => {
        expect(dialog.type()).toContain('alert');
        expect(dialog.message()).toContain('All fields are required!');
        await dialog.accept();
    })

    await page.$('a[href="/register"]');   
    expect(page.url()).toBe(registerUrl);
});

//8
test('Submit the register form with empty email fields', async ({ page }) =>{
    await page.goto(registerUrl);
    await page.click('input[type="submit"]');

    await page.fill('input[name="email"]', '');
    await page.fill('input[name="password"]', validPass);
    await page.fill('input[name="confirm-pass"]', validPass);
    await page.click('input[type="submit"]');
    
    page.on('dialog', async dialog => {
        expect(dialog.type()).toContain('alert');
        expect(dialog.message()).toContain('All fields are required!');
        await dialog.accept();
    })

    await page.$('a[href="/register"]');   
    expect(page.url()).toBe(registerUrl);
});

//9
test('Submit the register form with empty password fields', async ({ page }) =>{
    await page.goto(registerUrl);
    await page.click('input[type="submit"]');

    await page.fill('input[name="email"]', 'test@abv.bg');
    await page.fill('input[name="password"]', '');
    await page.fill('input[name="confirm-pass"]', validPass);
    await page.click('input[type="submit"]');
    
    page.on('dialog', async dialog => {
        expect(dialog.type()).toContain('alert');
        expect(dialog.message()).toContain('All fields are required!');
        await dialog.accept();
    })

    await page.$('a[href="/register"]');   
    expect(page.url()).toBe(registerUrl);
});

//10
test('Submit the register form with empty confirm password fields', async ({ page }) =>{
    await page.goto(registerUrl);
    await page.click('input[type="submit"]');

    await page.fill('input[name="email"]', 'test@abv.bg');
    await page.fill('input[name="password"]', validPass);
    await page.fill('input[name="confirm-pass"]', '');
    await page.click('input[type="submit"]');
    
    page.on('dialog', async dialog => {
        expect(dialog.type()).toContain('alert');
        expect(dialog.message()).toContain('All fields are required!');
        await dialog.accept();
    })

    await page.$('a[href="/register"]');   
    expect(page.url()).toBe(registerUrl);
});

//11
test('Submit the register form with different password fields', async ({ page }) =>{
    await page.goto(registerUrl);
    await page.click('input[type="submit"]');

    await page.fill('input[name="email"]', 'test@abv.bg');
    await page.fill('input[name="password"]', validPass);
    await page.fill('input[name="confirm-pass"]', '');
    await page.click('input[type="submit"]');
    
    page.on('dialog', async dialog => {
        expect(dialog.type()).toContain('alert');
        expect(dialog.message()).toContain("Passwords don't match!");
        await dialog.accept();
    })

    await page.$('a[href="/register"]');   
    expect(page.url()).toBe(registerUrl);
});

//12
test('Add book with correct data', async ({ page }) => {
    await page.goto(loginUrl);

    await submitAndLogin(page);
    
    await Promise.all([
        page.click('input[type="submit"]'),   
        page.waitForURL(catalogUrl)
    ]); 

    await page.click('a[href="/create"]');
    await page.waitForSelector('#create-form');

    await page.fill('#title', 'Test Book');
    await page.fill('#description', 'This is a test book description');
    await page.fill('#image', 'https://example.com/book-image.jpg');
    await page.selectOption('#type', 'Fiction');
    await page.click('#create-form input[type="submit"]');

    await page.waitForURL(catalogUrl)

    expect(page.url()).toBe(catalogUrl);
})

//13
test('Add book with empty title field', async ({ page }) => {
    await page.goto(loginUrl);

    await submitAndLogin(page);
    
    await Promise.all([
        page.click('input[type="submit"]'),   
        page.waitForURL(catalogUrl)
    ]); 

    await page.click('a[href="/create"]');
    await page.waitForSelector('#create-form');

    await page.fill('#title', '');
    await page.fill('#description', 'This is a test book description');
    await page.fill('#image', 'https://example.com/book-image.jpg');
    await page.selectOption('#type', 'Fiction');

    page.on('dialog', async dialog => {
        expect(dialog.type()).toContain('alert');
        expect(dialog.message()).toContain('All fields are required!');
        await dialog.accept();
    })

    await page.$('a[href="/create"]');   
    expect(page.url()).toBe('http://localhost:3000/create');
})

//14
test('Add book with empty description field', async ({ page }) => {
    await page.goto(loginUrl);

    await submitAndLogin(page);
    
    await Promise.all([
        page.click('input[type="submit"]'),   
        page.waitForURL(catalogUrl)
    ]); 

    await page.click('a[href="/create"]');
    await page.waitForSelector('#create-form');

    await page.fill('#title', 'Book Title');
    await page.fill('#description', '');
    await page.fill('#image', 'https://example.com/book-image.jpg');
    await page.selectOption('#type', 'Fiction');

    page.on('dialog', async dialog => {
        expect(dialog.type()).toContain('alert');
        expect(dialog.message()).toContain('All fields are required!');
        await dialog.accept();
    })

    await page.$('a[href="/create"]');   
    expect(page.url()).toBe('http://localhost:3000/create');
})

//15
test('Add book with empty image field', async ({ page }) => {
    await page.goto(loginUrl);

    await submitAndLogin(page);
    
    await Promise.all([
        page.click('input[type="submit"]'),   
        page.waitForURL(catalogUrl)
    ]); 

    await page.click('a[href="/create"]');
    await page.waitForSelector('#create-form');

    await page.fill('#title', 'Book Title');
    await page.fill('#description', 'This is a test book description');
    await page.fill('#image', '');
    await page.selectOption('#type', 'Fiction');

    page.on('dialog', async dialog => {
        expect(dialog.type()).toContain('alert');
        expect(dialog.message()).toContain('All fields are required!');
        await dialog.accept();
    })

    await page.$('a[href="/create"]');   
    expect(page.url()).toBe('http://localhost:3000/create');
})

//16
test('Login and verify all books are displayed', async ({ page }) => {
    await page.goto(loginUrl);

    await submitAndLogin(page);
    
    await Promise.all([
        page.click('input[type="submit"]'),   
        page.waitForURL(catalogUrl)
    ]); 

    await page.waitForSelector('.dashboard');

    const bookElement = await page.$$('.other-books-list li');

    expect(bookElement.length).toBeGreaterThan(0); 
})

//17
test('Verify that logged-in user sees details button and button works correctly', async ({ page }) => {
    await page.goto(loginUrl);

    await submitAndLogin(page);
    
    await Promise.all([
        page.click('input[type="submit"]'),   
        page.waitForURL(catalogUrl)
    ]); 

    await page.click('a[href="/catalog"]');
    await page.waitForSelector('.otherBooks');

    await page.click('.otherBooks a.button');

    const detailsPageTitle = await page.textContent('.book-information h3');
    expect(detailsPageTitle).toBe('Test Book'); 
});

//18
test('Verify that not logged-in user sees details button and button works correctly', async ({ page }) => {
    await page.goto(catalogUrl);
      
    await page.waitForSelector('.otherBooks');

    await page.click('.otherBooks a.button');

    const detailsPageTitle = await page.textContent('.book-information h3');
    expect(detailsPageTitle).toBe('Test Book'); 
});

//19
test('Verify that creator user can sees delete and edit button and button works correctly', async ({ page }) => {
    await page.goto(loginUrl);
   
    await submitAndLogin(page);
    
    await Promise.all([
        page.click('input[type="submit"]'),   
        page.waitForURL(catalogUrl)
    ]); 

    await page.click('a[href="/catalog"]');
    await page.waitForSelector('.otherBooks');

    await page.click('.otherBooks a.button');

    const detailsPageTitle = await page.textContent('.book-information h3');
    expect(detailsPageTitle).toBe('Test Book'); 
});






