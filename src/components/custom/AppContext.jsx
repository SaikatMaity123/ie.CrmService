import React, {createContext, useContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Default values
const AppContext = createContext();

export const AppProvider = ({children}) => {
  const [useIDEmployee, setIDEmployee] = useState('');
  const [useBusinessID, setBusinessID] = useState('');
  const [useEmpname, setEmpname] = useState('');
  const [useManagerAccess, setuseManagerAccess] = useState('');
  const [useMobileAccess, setuseMobileAccess] = useState('');
  const [useDivision, setDivision] = useState('');
  const [useSecurityKey, setSecurityKey] = useState('');
  const [useEmpemail, setEmpemail] = useState('');

  useEffect(() => {
    try {
      AsyncStorage.getItem('UserData').then(value => {
        if (value != null) {
          let user = JSON.parse(value);
          setIDEmployee(user.IDEmployee);
          setBusinessID(user.BusinessID);
          setEmpname(user.Empname);
          setuseManagerAccess(user.ManagerAccess);
          setuseMobileAccess(user.MobileAccess);
          setDivision(user.Division);
          setSecurityKey(user.SecurityKey);
          setEmpemail(user.Empemail);
        }
      });
    } catch (error) {
      Alert.alert(error);
    }
  }, []);

  const globalState = {
    useBusinessID: useBusinessID,
    useEmpemail: useEmpemail,
    useSecurityKey: useSecurityKey,
    useDivision: useDivision,
    useManagerAccess: useManagerAccess,
    useMobileAccess: useMobileAccess,
    useEmpname: useEmpname,
    useIDEmployee: useIDEmployee,
    cdate: new Date().toISOString().split('T')[0], // yyyy-mm-dd
  };

  return (
    <AppContext.Provider value={globalState}>{children}</AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
