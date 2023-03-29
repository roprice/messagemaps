import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

# Define the URL of the Pocketbase documentation site
base_url = 'https://python.langchain.com/en/latest/'

# Define the filename to save the HTML output to
filename = 'python-langchain-docs-3-20230329.html'

# Keep track of visited pages to prevent infinite looping
visited_pages = set()

# Initialize the HTML string
html_str = ''

def process_page(url):
    # Send a GET request to the URL and get the HTML content
    response = requests.get(url)
    html = response.content

    # Parse the HTML content using BeautifulSoup
    soup = BeautifulSoup(html, 'html.parser')

    # Find all links on the page
    links = soup.find_all('a', href=True)

    # Visit each page and append its HTML content to a string
    global html_str
    for link in links:
        page_url = link['href']
        link_url = urljoin(url, page_url)

        # If the link leads to a page on the same site and
        # the page hasn't already been visited, process it
        if link_url.startswith(base_url) and link_url not in visited_pages:
            visited_pages.add(link_url)
            process_page(link_url)

        # Send a GET request to the URL and get the HTML content
        response = requests.get(link_url)

        # Append the HTML content to the string
        html_str += response.text

# Start the processing with the base URL
process_page(base_url)

# Save the concatenated HTML string to a file
with open(filename, 'w') as file:
    file.write(html_str)
