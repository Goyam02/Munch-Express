document.addEventListener('DOMContentLoaded', function() {
    const locationDropdown = document.getElementById('locationDropdown');
    const locationOption = document.getElementById('locationOption');
    const locationText = document.getElementById('currentLocation');
    const searchInput = document.getElementById('locationSearch');
    const searchResults = document.getElementById('searchResults');
    let searchTimeout = null;

    locationOption.addEventListener('click', (e) => {
        e.stopPropagation();
        locationDropdown.classList.toggle('show');
        if (locationDropdown.classList.contains('show')) {
            searchInput.focus();
        }
    });

    document.addEventListener('click', (e) => {
        if (!locationDropdown.contains(e.target) && !locationOption.contains(e.target)) {
            locationDropdown.classList.remove('show');
        }
    });

    function handleSearchKeyup(event) {
        const query = event.target.value.trim();
        
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        if (!query) {
            searchResults.innerHTML = '';
            return;
        }

        searchResults.innerHTML = '<div class="loading-text">Searching...</div>';

        searchTimeout = setTimeout(() => {
            searchLocation(query);
        }, 500);
    }

    async function searchLocation(query) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=in`,
                {
                    headers: {
                        'Accept-Language': 'en-US,en;q=0.9',
                        'User-Agent': 'MunchExpress/1.0'
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const results = await response.json();

            if (!Array.isArray(results) || results.length === 0) {
                searchResults.innerHTML = '<div class="search-error">No locations found</div>';
                return;
            }

            searchResults.innerHTML = '';
            
            results.forEach(result => {
                const div = document.createElement('div');
                div.className = 'search-result-item';
                
                const address = result.address;
                let displayName = '';
                
                if (address.city) {
                    displayName = address.city;
                } else if (address.town) {
                    displayName = address.town;
                } else if (address.village) {
                    displayName = address.village;
                } else {
                    displayName = result.display_name.split(',').slice(0, 2).join(',');
                }

                if (address.state) {
                    displayName += `, ${address.state}`;
                }

                div.innerHTML = `
                    <div class="search-result-name">${displayName}</div>
                    <div class="search-result-address">${result.display_name}</div>
                `;
                
                div.addEventListener('click', () => {
                    selectLocation(result);
                });
                
                searchResults.appendChild(div);
            });

        } catch (error) {
            console.error('Search error:', error);
            searchResults.innerHTML = '<div class="search-error">Error searching for locations. Please try again.</div>';
        }
    }

    function handleSearchClick() {
        const query = searchInput.value.trim();
        if (query) {
            searchLocation(query);
        }
    }

    function selectLocation(result) {
        const address = result.address;
        let displayName = '';
        
        if (address.city) {
            displayName = address.city;
        } else if (address.town) {
            displayName = address.town;
        } else if (address.village) {
            displayName = address.village;
        } else {
            displayName = result.display_name.split(',').slice(0, 2).join(',');
        }

        if (address.state) {
            displayName += `, ${address.state}`;
        }
        
        localStorage.setItem('savedLocation', JSON.stringify({
            address: displayName,
            coordinates: { lat: result.lat, lng: result.lon },
            fullAddress: result.address
        }));

        locationText.textContent = displayName;
        searchInput.value = '';
        searchResults.innerHTML = '';
        locationDropdown.classList.remove('show');
    }

    async function detectCurrentLocation() {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        locationText.innerHTML = `
            <i class="fas fa-spinner loading-spinner"></i>
            Detecting your location...
        `;

        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                });
            });

            const { latitude, longitude } = position.coords;
            
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&countrycodes=in`,
                {
                    headers: {
                        'Accept-Language': 'en-US,en;q=0.9',
                        'User-Agent': 'MunchExpress/1.0'
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            selectLocation(result);

        } catch (error) {
            console.error('Error:', error);
            locationText.textContent = 'Could not detect location';
            
            if (error.code === 1) {
                alert('Location access denied. Please enable location services in your browser settings.');
            } else if (error.code === 2) {
                alert('Location unavailable. Please check your GPS settings and try again.');
            } else {
                alert('Unable to detect your location. Please try searching instead.');
            }
        }
    }

    // Load saved location on page load
    const savedLocation = localStorage.getItem('savedLocation');
    if (savedLocation) {
        const { address } = JSON.parse(savedLocation);
        locationText.textContent = address;
    }
}); 