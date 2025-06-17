<script>
    import { onMount } from 'svelte';

    let username = '';
    let password = '';
    let loginError = '';
    let isLoading = false;
    let isAuthenticated = false; 

    let showToast = false;
    let toastMessage = '';
    let toastType = 'success'; 

    const LOGIN_API_URL = 'http://localhost:8080/api/auth/login';

    function showToastNotification(message, type) {
        toastMessage = message;
        toastType = type;
        showToast = true;

        setTimeout(() => {
            showToast = false;
            toastMessage = '';
        }, 3000);
    }

    async function checkAuthStatus() {
        try {
            const response = await fetch('http://localhost:8080/api/auth/check-auth', {
                credentials: 'include' 
            });
            isAuthenticated = response.ok;
            if (isAuthenticated) {
            }
        } catch (error) {
            console.error('Fejl ved tjek af login-status:', error);
            isAuthenticated = false;
        }
    }


    onMount(() => {
        checkAuthStatus();
    });

    // Håndter login-submit
    async function handleLogin() {
        loginError = '';
        isLoading = true;

        try {
            const response = await fetch(LOGIN_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                isAuthenticated = true;
                username = ''; 
                password = '';
                console.log('Login succesfuld!');
                showToastNotification('Login succesfuld!', 'success');

            } else {
                const errorData = await response.json().catch(() => ({ error: 'Ukendt fejl ved login' }));
                loginError = errorData.error || 'Login mislykkedes. Tjek brugernavn og adgangskode.';
                isAuthenticated = false;
                console.error('Login fejl:', errorData);
                showToastNotification(loginError, 'error');
            }
        } catch (error) {
            loginError = 'Netværksfejl eller serveren er utilgængelig.';
            isAuthenticated = false;
            console.error('Netværksfejl ved login:', error);
            showToastNotification(loginError, 'error');
        } finally {
            isLoading = false;
        }
    }


    async function handleSignOut() {
        isLoading = true;
        try {

            const response = await fetch('http://localhost:8080/api/auth/logout', {
                method: 'POST',
                credentials: 'include' 
            });

            if (response.ok) {
                isAuthenticated = false;
                console.log('Logud succesfuld. Backend session er destrueret.');
                showToastNotification('Du er logget ud.', 'success'); 
            } else {
                const errorData = await response.json().catch(() => ({ error: 'Ukendt fejl ved logud' }));
                console.error('Logud fejl:', errorData.error || 'Fejl ved logud.');

                isAuthenticated = false;
                showToastNotification(errorData.error || 'Fejl ved logud.', 'error');
            }
        } catch (error) {
            console.error('Netværksfejl ved logud:', error);
            isAuthenticated = false;
            showToastNotification('Netværksfejl ved logud.', 'error');
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="login-container">
    <div class="auth-box">
        {#if !isAuthenticated}
            <h2>Login</h2>
            <form on:submit|preventDefault={handleLogin}>
                <input type="text" bind:value={username} placeholder="Brugernavn" required disabled={isLoading} />
                <input type="password" bind:value={password} placeholder="Adgangskode" required disabled={isLoading} />

                {#if loginError}
                    <p class="error-message">{loginError}</p>
                {/if}

                {#if isLoading}
                    <p class="loading-message">Logger ind...</p>
                {/if}

                <button type="submit" disabled={isLoading}>Log ind</button>
            </form>
        {:else}
            <h2>Velkommen!</h2>
            <p class="status-message">Du er logget ind.</p>
            <button on:click={handleSignOut} disabled={isLoading}>Log ud</button>
        {/if}
    </div>
</div>

<!-- Toast Notifikation UI -->
{#if showToast}
    <div class="toast-notification {toastType}">
        {toastMessage}
    </div>
{/if}

