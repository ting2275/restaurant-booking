import axios from 'axios';

export function createApi(baseURL, headers = {}) {
  return axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}
export function useTaiwanZipCode() {

  // 新版郵遞區號API
  const api = createApi(import.meta.env.VITE_API_BASE_URL || 'https://api.example.com');

  const fetchZipCodeData = async (city, district) => {
    try {
      const response = await api.get('/Zipcode', {
        params: {
          city,
          district
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchCitiesAndDistricts = async () => {
    try {
      const response = await api.get('/Zipcode');
      return response.data;
    } catch (error) {
      console.error('Error fetching cities and districts:', error);
    }
  };

  return {
    fetchZipCodeData,
    fetchCitiesAndDistricts
  };
}

// 舊版郵遞區號API
// export function useTaiwanZipCode() {
//   const fetchZipCodeData = async (city, district, zipCode) => {
//     try {
//       const response = await axios.get('/zipcode-api/twzipcode', {
//         params: {
//           city,
//           district,
//           zip_code: zipCode
//         }
//       });
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching data:', error);
//     }
//   };

//   const fetchCitiesAndDistricts = async () => {
//     try {
//       const response = await axios.get('/zipcode-api/twzipcode');
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching cities and districts:', error);
//     }
//   };

//   return {
//     fetchZipCodeData,
//     fetchCitiesAndDistricts
//   };
// }