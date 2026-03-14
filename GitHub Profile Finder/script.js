class GitHubProfileFinder {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.loadingSection = document.getElementById('loadingSection');
        this.errorSection = document.getElementById('errorSection');
        this.profileSection = document.getElementById('profileSection');
        this.reposSection = document.getElementById('reposSection');
        this.reposGrid = document.getElementById('reposGrid');
        this.tryAgainBtn = document.getElementById('tryAgainBtn');
        
        this.initEventListeners();
    }

    initEventListeners() {
        this.searchBtn.addEventListener('click', () => this.searchProfile());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchProfile();
            }
        });
        this.tryAgainBtn.addEventListener('click', () => {
            this.resetUI();
            this.searchInput.focus();
        });
        
        // Clear search on input focus if empty
        this.searchInput.addEventListener('focus', () => {
            if (this.searchInput.value.trim() === '') {
                this.hideAllSections();
            }
        });
    }

    async searchProfile() {
        const username = this.searchInput.value.trim();
        
        if (!username) {
            this.showError('Please enter a GitHub username.');
            return;
        }

        this.showLoading();
        
        try {
            // Fetch user profile
            const userResponse = await fetch(`https://api.github.com/users/${username}`);
            
            if (!userResponse.ok) {
                throw new Error('User not found');
            }
            
            const userData = await userResponse.json();
            
            // Fetch repositories
            const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`);
            const reposData = await reposResponse.json();
            
            this.displayProfile(userData, reposData);
            
        } catch (error) {
            console.error('Error fetching data:', error);
            this.showError(
                error.message === 'User not found' 
                    ? 'User not found. Please try another GitHub username.' 
                    : 'Something went wrong. Please try again.'
            );
        }
    }

    displayProfile(user, repos) {
        // Profile info
        document.getElementById('profileAvatar').src = user.avatar_url || '';
        document.getElementById('profileAvatar').alt = `${user.login}'s avatar`;
        document.getElementById('profileName').textContent = user.name || user.login;
        document.getElementById('profileUsername').textContent = `@${user.login}`;
        document.getElementById('profileBio').textContent = user.bio || 'No bio available.';
        document.getElementById('profileLink').href = user.html_url;
        document.getElementById('reposCount').textContent = user.public_repos || 0;
        document.getElementById('followersCount').textContent = user.followers || 0;
        document.getElementById('followingCount').textContent = user.following || 0;
        document.getElementById('profileLocation').textContent = user.location || 'Location not available';

        // Display profile section
        this.profileSection.style.display = 'block';
        
        // Display repositories
        this.displayRepositories(repos);
        
        // Hide other sections
        this.hideSections(['loadingSection', 'errorSection']);
        
        // Scroll to profile
        this.profileSection.scrollIntoView({ behavior: 'smooth' });
    }

    displayRepositories(repos) {
        this.reposGrid.innerHTML = '';
        this.reposSection.style.display = 'block';

        if (repos.length === 0) {
            this.reposGrid.innerHTML = `
                <div class="empty-repos">
                    <i class="fas fa-folder-open"></i>
                    <h4>No public repositories found</h4>
                    <p>This user doesn't have any public repositories yet.</p>
                </div>
            `;
            return;
        }

        // Sort repos by stars (descending)
        const sortedRepos = repos.sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0));

        sortedRepos.slice(0, 6).forEach(repo => {
            const repoCard = this.createRepoCard(repo);
            this.reposGrid.appendChild(repoCard);
        });
    }

    createRepoCard(repo) {
        const repoCard = document.createElement('div');
        repoCard.className = 'repo-card';
        repoCard.innerHTML = `
            <a href="${repo.html_url}" target="_blank" class="repo-link">
                <div class="repo-name">
                    <i class="fab fa-github"></i>
                    ${repo.name}
                </div>
            </a>
            ${repo.description ? `<p class="repo-desc">${repo.description}</p>` : ''}
            <div class="repo-meta">
                ${repo.language ? `<span><i class="fas fa-code"></i> ${repo.language}</span>` : ''}
                <span class="repo-stars">
                    <i class="fas fa-star"></i>
                    ${repo.stargazers_count || 0}
                </span>
            </div>
        `;
        return repoCard;
    }

    showLoading() {
        this.hideAllSections();
        this.loadingSection.style.display = 'flex';
    }

    showError(message) {
        document.getElementById('errorMessage').textContent = message;
        this.hideAllSections();
        this.errorSection.style.display = 'flex';
    }

    hideAllSections() {
        this.loadingSection.style.display = 'none';
        this.errorSection.style.display = 'none';
        this.profileSection.style.display = 'none';
        this.reposSection.style.display = 'none';
    }

    hideSections(sectionIds) {
        sectionIds.forEach(id => {
            document.getElementById(id).style.display = 'none';
        });
    }

    resetUI() {
        this.searchInput.value = '';
        this.hideAllSections();
        this.searchInput.focus();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GitHubProfileFinder();
});

// Add some demo usernames for quick testing
document.addEventListener('DOMContentLoaded', () => {
    const demoUsernames = ['octocat', 'torvalds', 'sindresorhus', 'facebook', 'microsoft'];
    
    // You can uncomment this to show demo suggestions
    /*
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('focus', () => {
        if (!searchInput.value.trim()) {
            // Show demo usernames as placeholder or suggestions
        }
    });
    */
});