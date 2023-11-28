import React, { useEffect } from 'react';

interface TwitterOAuthPopupProps {
  apiUrl: string;
}

const TwitterOAuthPopup: React.FC<TwitterOAuthPopupProps> = ({ apiUrl }) => {
  useEffect(() => {
    const fetchData = async () => {
      try {
        window.location.replace(apiUrl);

        //const response = await fetch(apiUrl);
        //const data = await response.json();
        //window.opener?.postMessage({ type: 'API_RESPONSE', data }, '*');
        //window.close();
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    return () => {
      // Cleanup function if needed
    };
  }, [apiUrl]);

  return (
    <div>
      <h1>Twitter OAuth Popup</h1>
      {/* Add your content here */}
    </div>
  );
};

export default TwitterOAuthPopup;