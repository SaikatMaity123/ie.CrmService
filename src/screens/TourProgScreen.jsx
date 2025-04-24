import {
  View,
  Text,
  ImageBackground,
  Dimensions,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  StyleSheet,
  Alert,
  //TextInput,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Dropdown} from 'react-native-element-dropdown';
import {TextInput} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {MultipleSelectList} from 'react-native-dropdown-select-list';
import CustomButton from '../components/custom/CustomButton';
import moment from 'moment';
import {BASE_URL} from '@env';
import NetInfo from '@react-native-community/netinfo';
import {MultiSelect} from 'react-native-element-dropdown';

const TourProgScreen = props => {
  const [useBusinessID, setBusinessID] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [useHQ, setHQ] = useState('');
  const [empNO, setEmpno] = useState('');
  const [useDivision, setDivision] = useState('');
  const [isFocus, setIsFocus] = useState(false);
  const [useRemarks, setRemarks] = useState('');
  const [useIDEmployee, setIDEmployee] = useState('');
  const [useWTData, setWTData] = useState([]);
  const [useWTESData, setWTESData] = useState([]);
  const [wtdataLabel, setwtdataLabel] = useState('');
  const [wtdataValue, setwtdataValue] = useState('');
  const [wtESdataLabel, setWTESdataLabel] = useState('');
  const [wtESdataValue, setWTESdataValue] = useState('');
  const [selectedArea, setSelectedArea] = useState([]);
  const [selectedAreaES, setSelectedAreaES] = useState([]);
  // const [selectedAreaData, setSelectedAreaData] = useState('');
  const [selectedAreaData, setSelectedAreaData] = useState([]);
  //const [selectedAreaDataES, setSelectedAreaDataES] = useState('');
  const [selectedAreaDataES, setSelectedAreaDataES] = useState([]);
  const [useDoctorData, setDoctorData] = useState([]);
  //const [useDoctorDataSelected, setDoctorDataSelected] = useState('');
  const [useDoctorDataSelected, setDoctorDataSelected] = useState([]);
  const [useDoctorDataES, setDoctorDataES] = useState([]);
  //const [useDoctorDataSelectedES, setDoctorDataSelectedES] = useState('');
  const [useDoctorDataSelectedES, setDoctorDataSelectedES] = useState([]);
  const [useRetailerData, setRetailerData] = useState([]);
  //const [useRetailerDataSelected, setRetailerDataSelected] = useState('');
  const [useRetailerDataSelected, setRetailerDataSelected] = useState([]);
  const [useRetailerDataES, setRetailerDataES] = useState([]);
  //const [useRetailerDataSelectedES, setRetailerDataSelectedES] = useState('');
  const [useRetailerDataSelectedES, setRetailerDataSelectedES] = useState([]);
  const [usevisitWTData, setvisitWTData] = useState([]);
  //const [usevisitWTDataSelected, setvisitWTDataSelected] = useState('');
  const [usevisitWTDataSelected, setvisitWTDataSelected] = useState([]);
  const [usevisitWTDataES, setvisitWTDataES] = useState([]);
  //const [usevisitWTDataSelectedES, setvisitWTDataSelectedES] = useState('');
  const [usevisitWTDataSelectedES, setvisitWTDataSelectedES] = useState([]);
  const [shouldShowESWT, setshouldShowESWT] = useState(false);
  const [shouldShowWT, setshouldShowWT] = useState(false);
  const [useManagerAccess, setuseManagerAccess] = useState('');
  const [selectedAreaTest, setSelectedAreaTest] = useState([]);
  const [selectedAreaESTest, setSelectedAreaESTest] = useState([]);
  const [useDoctorDataTest, setDoctorDataTest] = useState([]);
  const [useDoctorDataESTest, setDoctorDataESTest] = useState([]);
  const [useRetailerDataTest, setRetailerDataTest] = useState([]);
  const [useRetailerDataESTest, setRetailerDataESTest] = useState([]);
  const [usevisitWTDataTest, setvisitWTDataTest] = useState([]);
  const [usevisitWTDataESTest, setvisitWTDataESTest] = useState([]);
  //const [usetdDataSelected, settdDataSelected] = useState('');
  const [usetdDataSelected, settdDataSelected] = useState([]);
  const [useTDData, setTDData] = useState([]);
  const [usetourDateTest, settourDateTest] = useState([]);

  let areaList = "''",
    areaListES = "''",
    doctorList = '',
    doctorListES = '',
    vwtList = '',
    tdList = '',
    vwtListES = '',
    retailerList = '',
    retailerListES = '';
  var cYear = moment().year();

  useEffect(() => {
    //console.warn(props.route.params.monthStatus);
    getData();
  }, []);

  const getData = () => {
    try {
      AsyncStorage.getItem('UserData').then(value => {
        if (value != null) {
          let user = JSON.parse(value);
          setEmpno(user.Empno);
          //setEmpname(user.Empname);
          //console.warn(user.ManagerAccess);
          setHQ(user.HQ);
          setDivision(user.Division);
          setIDEmployee(user.IDEmployee);
          setEmpEmail(user.Empemail);
          setBusinessID(user.BusinessID);
          setuseManagerAccess(user.ManagerAccess);
          //console.warn(user);
          NetInfo.fetch().then(state => {
            if (state.isConnected) {
              if (user.ManagerAccess === true) {
                //Get Work Type Dropdown Data
                wtDDOpen(user.BusinessID);
                managerVisitWithtDDOpen(user.BusinessID, user.IDEmployee);

                //Get Tour Date Dropdown Data
                tourDateDDOpen(user.BusinessID, user.IDEmployee);
              } else {
                //Get Work Type Dropdown Data
                wtDDOpen(user.BusinessID);
                //Get Area Type Dropdown Data
                atDDOpen(user.BusinessID, user.IDHQ);
                //Get Visit With Dropdown Data
                visitWithDDOpen(user.BusinessID, user.IDEmployee);
                //Get Tour Date Dropdown Data
                tourDateDDOpen(user.BusinessID, user.IDEmployee);
              }
            } else {
              Alert.alert('No Internet');
            }
          }, []);
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  const wtDDOpen = businessID => {
    //console.log(useBusinessID);
    const wturl =
      BASE_URL + 'Misc/List?Businessid=' + businessID + '&Type=WORKTYPE';
    console.log(wturl);
    var config = {
      method: 'get',
      url: wturl,
    };
    axios(config)
      .then(function (response) {
        //console.log(JSON.stringify(response.data));
        var count = Object.keys(response.data).length;
        let wtNameArray = [];
        for (var i = 0; i < count; i++) {
          wtNameArray.push({
            //value: response.data[i].Value,
            value: response.data[i].IDMisc,
            label: response.data[i].Name,
          });
        }
        setWTData(wtNameArray);
        setWTESData(wtNameArray);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const atDDOpen = (businessID, hqID) => {
    const aturl =
      BASE_URL +
      'Employee/EmpAreaList?Businessid=' +
      businessID +
      '&IDHQ=' +
      hqID;
    console.log('aturl ' + aturl);
    var config = {
      method: 'get',
      url: aturl,
    };
    axios(config)
      .then(function (response) {
        //console.log(JSON.stringify(response.data));
        var count = Object.keys(response.data).length;
        let atNameArray = [];
        for (var i = 0; i < count; i++) {
          atNameArray.push({
            // value: response.data[i].Name,
            // //label: response.data[i].IDArea,
            // key: response.data[i].IDArea,
            value: response.data[i].IDArea,
            label: response.data[i].Name,
          });
        }
        setSelectedAreaData(atNameArray);
        setSelectedAreaDataES(atNameArray);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const doctorDDOpen = async areaList => {
    // const docurl =
    //   BASE_URL +
    //   'Doctor/MultipleAreaWiseDoctorList?Businessid=' +
    //   useBusinessID +
    //   '&Areas=' +
    //   areaList +
    //   '&EntryUser=' +
    //   empEmail +
    //   '&IDEmployee=' +
    //   useIDEmployee;
    // console.log(docurl);
    // var config = {
    //   method: 'get',
    //   url: docurl,
    // };
    // axios(config)
    //   .then(function (response) {
    //     //console.log(JSON.stringify(response.data));
    //     var count = Object.keys(response.data).length;
    //     let docNameArray = [];
    //     for (var i = 0; i < count; i++) {
    //       docNameArray.push({
    //         value: response.data[i].Name,
    //         //label: response.data[i].Code,
    //         key: response.data[i].IDDoctor,
    //       });
    //     }
    //     setDoctorDataSelected(docNameArray);
    //   })
    //   .catch(function (error) {
    //     console.log(error);
    //   });

    const docurl =
      BASE_URL +
      'Doctor/MultipleAreaWiseDoctorList?Businessid=' +
      useBusinessID +
      '&Areas=' +
      areaList +
      '&EntryUser=' +
      empEmail +
      '&IDEmployee=' +
      useIDEmployee;
    console.log(docurl);
    try {
      const response = await axios.get(docurl);
      // Map the API response to dropdown format
      const formattedData = response.data.map(item => ({
        label: item.Name + ' ' + item.Code,
        value: item.IDDoctor,
      }));
      setDoctorDataSelected(formattedData);
      //setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      //setLoading(false);
    }
  };
  const doctorDDOpenES = areaListES => {
    const docurl =
      BASE_URL +
      'Doctor/MultipleAreaWiseDoctorList?Businessid=' +
      useBusinessID +
      '&Areas=' +
      areaListES +
      '&EntryUser=' +
      empEmail +
      '&IDEmployee=' +
      useIDEmployee;
    console.log(docurl);
    var config = {
      method: 'get',
      url: docurl,
    };
    axios(config)
      .then(function (response) {
        //console.log(JSON.stringify(response.data));
        var count = Object.keys(response.data).length;
        let docNameArray = [];
        for (var i = 0; i < count; i++) {
          docNameArray.push({
            value: response.data[i].IDDoctor,
            label: response.data[i].Name + ' ' + response.data[i].Code,
          });
        }
        setDoctorDataSelectedES(docNameArray);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const retailerDDOpen = areaList => {
    const retailerurl =
      BASE_URL +
      'Retailer/MultipleAreaWiseRetailerList?Businessid=' +
      useBusinessID +
      '&Areas=' +
      areaList +
      '&EntryUser=' +
      empEmail +
      '&IDEmployee=' +
      useIDEmployee;
    console.log(retailerurl);
    var config = {
      method: 'get',
      url: retailerurl,
    };
    axios(config)
      .then(function (response) {
        //console.log(JSON.stringify(response.data));
        var count = Object.keys(response.data).length;
        let retNameArray = [];
        for (var i = 0; i < count; i++) {
          retNameArray.push({
            // value: response.data[i].Name,
            // //label: response.data[i].Code,
            // key: response.data[i].IDRetailer,
            value: response.data[i].IDRetailer,
            label: response.data[i].Name + ' ' + response.data[i].Code,
          });
        }
        setRetailerDataSelected(retNameArray);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const retailerDDOpenES = areaListES => {
    const retailerurl =
      BASE_URL +
      'Retailer/MultipleAreaWiseRetailerList?Businessid=' +
      useBusinessID +
      '&Areas=' +
      areaListES +
      '&EntryUser=' +
      empEmail +
      '&IDEmployee=' +
      useIDEmployee;
    console.log(retailerurl);
    var config = {
      method: 'get',
      url: retailerurl,
    };
    axios(config)
      .then(function (response) {
        //console.log(JSON.stringify(response.data));
        var count = Object.keys(response.data).length;
        let retNameArray = [];
        for (var i = 0; i < count; i++) {
          retNameArray.push({
            value: response.data[i].IDRetailer,
            label: response.data[i].Name + ' ' + response.data[i].Code,
          });
        }
        setRetailerDataSelectedES(retNameArray);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const visitWithDDOpen = (businessID, idemp) => {
    const vwturl =
      BASE_URL +
      'Employee/EmployeeUpwardManagerList?Businessid=' +
      businessID +
      '&IDEmployee=' +
      idemp;
    console.log(vwturl);
    var config = {
      method: 'get',
      url: vwturl,
    };
    axios(config)
      .then(function (response) {
        // console.log(JSON.stringify(response.data));
        var count = Object.keys(response.data).length;
        let visitwtArray = [];
        for (var i = 0; i < count; i++) {
          visitwtArray.push({
            value: response.data[i].IDEmployee,
            label: response.data[i].Name,
          });
        }
        visitwtArray.pop();
        //console.warn(visitwtArray);
        setvisitWTDataSelected(visitwtArray);
        setvisitWTDataSelectedES(visitwtArray);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const tourDateDDOpen = async (businessID, idemp) => {
    //console.warn(props.route.params.item);

    // console.log(tdurl);
    // var config = {
    //   method: 'get',
    //   url: tdurl,
    // };
    // axios(config)
    //   .then(function (response) {
    //     // console.log(JSON.stringify(response.data));
    //     var count = Object.keys(response.data).length;
    //     let tdArray = [];
    //     for (var i = 0; i < count; i++) {
    //       tdArray.push({
    //         value: response.data[i].Date + '(' + response.data[i].DayName + ')',
    //         //label: response.data[i].Code,
    //         //key: response.data[i].IDEmployee,
    //       });
    //     }
    //     settdDataSelected(tdArray);
    //   })
    //   .catch(function (error) {
    //     console.log(error);
    //   });

    const tdurl =
      BASE_URL +
      'TourProgram/Date?Businessid=' +
      businessID +
      '&Month=' +
      props.route.params.month +
      '&Year=' +
      props.route.params.year +
      '&IDEmployee=' +
      idemp;
    try {
      const response = await axios.get(tdurl);
      // Map the API response to dropdown format
      const formattedData = response.data.map(item => ({
        value: item.Date + '(' + item.DayName + ')',
      }));
      settdDataSelected(formattedData);
      //setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      //setLoading(false);
    }
  };

  const managerAreaListDDOpen = (businessID, idemp) => {
    //console.warn(props.route.params.item);
    const maurl =
      BASE_URL +
      'Manager/TourProgram/Areas/List?Businessid=' +
      businessID +
      '&employees=' +
      idemp;
    console.log(maurl);
    var config = {
      method: 'get',
      url: maurl,
    };
    axios(config)
      .then(function (response) {
        // console.log(JSON.stringify(response.data));
        var count = Object.keys(response.data).length;
        let tdArray = [];
        for (var i = 0; i < count; i++) {
          tdArray.push({
            // value: response.data[i].Name,
            // //label: response.data[i].IDArea,
            // key: response.data[i].IDArea,
            value: response.data[i].IDArea,
            label: response.data[i].Name,
          });
        }
        setSelectedAreaData(tdArray);
        //setSelectedAreaDataES(tdArray);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const managerdoctorListDDOpen = (businessID, idemp) => {
    //console.warn(props.route.params.item);
    const durl =
      BASE_URL +
      'Manager/TourProgram/Doctors/List?Businessid=' +
      businessID +
      '&employees=' +
      idemp;
    console.log(durl);
    var config = {
      method: 'get',
      url: durl,
    };
    axios(config)
      .then(function (response) {
        // console.log(JSON.stringify(response.data));
        var count = Object.keys(response.data).length;
        let tdArray = [];
        for (var i = 0; i < count; i++) {
          tdArray.push({
            // value: response.data[i].Name + ' ' + response.data[i].Code,
            // //label: response.data[i].IDArea,
            // key: response.data[i].IDDoctor,
            value: response.data[i].IDDoctor,
            label: response.data[i].Name + ' ' + response.data[i].Code,
          });
        }
        setDoctorDataSelected(tdArray);
        //setDoctorDataSelectedES(tdArray);
      })
      .catch(function (error) {
        console.log(error);
      });
  };
  const managerretailerListDDOpen = (businessID, idemp) => {
    //console.warn(props.route.params.item);
    const durl =
      BASE_URL +
      'Manager/TourProgram/Retailers/List?Businessid=' +
      businessID +
      '&employees=' +
      idemp;
    console.log(durl);
    var config = {
      method: 'get',
      url: durl,
    };
    axios(config)
      .then(function (response) {
        // console.log(JSON.stringify(response.data));
        var count = Object.keys(response.data).length;
        let tdArray = [];
        for (var i = 0; i < count; i++) {
          tdArray.push({
            value: response.data[i].IDParty,
            label: response.data[i].Name + ' ' + response.data[i].Code,
          });
        }
        setRetailerDataSelected(tdArray);
        //setRetailerDataSelectedES(tdArray);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const managerAreaListESDDOpen = (businessID, idemp) => {
    //console.warn(props.route.params.item);
    const maurl =
      BASE_URL +
      'Manager/TourProgram/Areas/List?Businessid=' +
      businessID +
      '&employees=' +
      idemp;
    console.log('maurl' + maurl);
    var config = {
      method: 'get',
      url: maurl,
    };
    axios(config)
      .then(function (response) {
        // console.log(JSON.stringify(response.data));
        var count = Object.keys(response.data).length;
        let tdArray = [];
        for (var i = 0; i < count; i++) {
          tdArray.push({
            value: response.data[i].IDArea,
            label: response.data[i].Name,
          });
        }
        setSelectedAreaData(tdArray);
        setSelectedAreaDataES(tdArray);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const managerdoctorListESDDOpen = (businessID, idemp) => {
    //console.warn(props.route.params.item);
    const durl =
      BASE_URL +
      'Manager/TourProgram/Doctors/List?Businessid=' +
      businessID +
      '&employees=' +
      idemp;
    console.log(durl);
    var config = {
      method: 'get',
      url: durl,
    };
    axios(config)
      .then(function (response) {
        // console.log(JSON.stringify(response.data));
        var count = Object.keys(response.data).length;
        let tdArray = [];
        for (var i = 0; i < count; i++) {
          tdArray.push({
            value: response.data[i].IDDoctor,
            label: response.data[i].Name + ' ' + response.data[i].Code,
          });
        }
        setDoctorDataSelectedES(tdArray);
      })
      .catch(function (error) {
        console.log(error);
      });
  };
  const managerretailerListESDDOpen = (businessID, idemp) => {
    //console.warn(props.route.params.item);
    const durl =
      BASE_URL +
      'Manager/TourProgram/Retailers/List?Businessid=' +
      businessID +
      '&employees=' +
      idemp;
    console.log(durl);
    var config = {
      method: 'get',
      url: durl,
    };
    axios(config)
      .then(function (response) {
        // console.log(JSON.stringify(response.data));
        var count = Object.keys(response.data).length;
        let tdArray = [];
        for (var i = 0; i < count; i++) {
          tdArray.push({
            value: response.data[i].IDParty,
            label: response.data[i].Name + ' ' + response.data[i].Code,
          });
        }
        setRetailerDataSelectedES(tdArray);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const managerVisitWithtDDOpen = (businessID, idemp) => {
    //console.warn(props.route.params.item);
    const vwturl =
      BASE_URL +
      'manager/tourprogram/Hierarchy/All?Businessid=' +
      businessID +
      '&IDEmployee=' +
      idemp;
    console.log(vwturl);
    var config = {
      method: 'get',
      url: vwturl,
    };
    axios(config)
      .then(function (response) {
        // console.log(JSON.stringify(response.data));
        var count = Object.keys(response.data).length;
        let tdArray = [];
        for (var i = 0; i < count; i++) {
          tdArray.push({
            // value: response.data[i].EmployeeName,
            // //label: response.data[i].IDArea,
            // key: response.data[i].IDEmployee,
            value: response.data[i].IDEmployee,
            label: response.data[i].EmployeeName,
          });
        }
        setvisitWTDataSelected(tdArray);
        setvisitWTDataSelectedES(tdArray);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  //MultSelect Area List
  const multiSelectList = item => {
    let res = item;
    //let es = selectedAreaES;
    areaList = res.toString() + ',' + "''";
    // areaList =  es.toString() + ',' + "''";

    let Mareas = [];
    item.map(function (value) {
      Mareas.push({IDArea: value, Shift: 'MORNING'});
    });

    setSelectedAreaTest(Mareas);

    console.log(areaList);
    console.log(Mareas);

    if (useManagerAccess === true) {
    } else {
      //Doctor Dropdown API Call
      doctorDDOpen(areaList);

      //Retailer Dropdown API Call
      retailerDDOpen(areaList);
    }
  };

  //MultSelect Area List Evening Shift
  const multiSelectListES = item => {
    let res = item;
    //let es = selectedAreaES;
    areaListES = res.toString() + ',' + "''";
    // areaList =  es.toString() + ',' + "''";

    let Eareas = [];
    item.map(function (value) {
      Eareas.push({IDArea: value, Shift: 'EVENING'});
    });
    setSelectedAreaESTest(Eareas);
    console.log(Eareas);

    if (useManagerAccess === true) {
    } else {
      //Doctor Dropdown API Call
      doctorDDOpenES(areaListES);

      //Retailer Dropdown API Call
      retailerDDOpenES(areaListES);
    }
  };

  //MultSelect Doctor List
  const multiSelectDoctor = item => {
    // let res = useDoctorData;
    // doctorList = res.toString();
    // console.log(doctorList);
    // let Mdoctors = [];
    // useDoctorData.map(function (value) {
    //   Mdoctors.push({IDDoctor: value, Shift: 'MORNING'});
    // });

    let res = item;
    doctorList = res.toString();
    console.log(doctorList);
    let Mdoctors = [];
    item.map(function (value) {
      Mdoctors.push({IDDoctor: value, Shift: 'MORNING'});
    });
    setDoctorDataTest(Mdoctors);

    console.log(Mdoctors);
  };
  //MultSelect Doctor List Evening Shift
  const multiSelectDoctorES = item => {
    let res = item;
    doctorListES = res.toString();
    console.log(doctorListES);

    let Edoctors = [];
    item.map(function (value) {
      Edoctors.push({IDDoctor: value, Shift: 'EVENING'});
    });

    setDoctorDataESTest(Edoctors);

    console.log(Edoctors);
  };

  //MultSelect Retailer List
  const multiSelectRetailer = item => {
    let res = item;
    retailerList = res.toString();
    console.log(retailerList);

    let Mretailrs = [];
    item.map(function (value) {
      Mretailrs.push({IDRetailer: value, Shift: 'MORNING'});
    });

    setRetailerDataTest(Mretailrs);

    console.log(Mretailrs);
  };

  //MultSelect Retailer List Evening Shift
  const multiSelectRetailerES = item => {
    let res = item;
    retailerListES = res.toString();
    console.log(retailerListES);

    let Eretailrs = [];
    item.map(function (value) {
      Eretailrs.push({IDRetailer: value, Shift: 'EVENING'});
    });

    setRetailerDataESTest(Eretailrs);

    console.log(Eretailrs);
  };
  //MultSelect Tour Date List
  const multiSelectTourDate = item => {
    let res = item;
    tdList = res.toString();
    console.log(tdList);

    let tourDate = [];
    item.map(function (value) {
      tourDate.push({Date: value});
    });

    settourDateTest(tourDate);

    console.log(tourDate);
  };
  //MultSelect Visit With List
  const multiSelectVisitWith = item => {
    let res = item;
    vwtList = res.toString();
    console.log('vwtList', vwtList);

    let Mvisitwith = [];
    item.map(function (value) {
      Mvisitwith.push({IDEmployee: value, Shift: 'MORNING'});
    });

    setvisitWTDataTest(Mvisitwith);
    console.log(Mvisitwith);

    if (useManagerAccess === true) {
      //Area List Dropdown API Call for Manger
      managerAreaListDDOpen(useBusinessID, vwtList);
      //Doctor Dropdown API Call for Manger
      managerdoctorListDDOpen(useBusinessID, vwtList);
      //Retailer Dropdown API Call for Manger
      managerretailerListDDOpen(useBusinessID, vwtList);
    }
  };

  //MultSelect Visit With List Evening Shift
  const multiSelectVisitWithES = item => {
    let res = item;
    vwtListES = res.toString();
    console.log(vwtListES);

    let Evisitwith = [];
    item.map(function (value) {
      Evisitwith.push({IDEmployee: value, Shift: 'EVENING'});
    });

    setvisitWTDataESTest(Evisitwith);

    console.log(Evisitwith);

    if (useManagerAccess === true) {
      //Area List Dropdown API Call for Manger
      managerAreaListESDDOpen(useBusinessID, vwtListES);
      //Doctor Dropdown API Call for Manger
      managerdoctorListESDDOpen(useBusinessID, vwtListES);
      //Retailer Dropdown API Call for Manger
      managerretailerListESDDOpen(useBusinessID, vwtListES);
    }
  };
  const save = () => {
    if (useManagerAccess === true) {
      if (usetourDateTest.length === 0) {
        Alert.alert('Select Tour Date');
      } else if (wtdataLabel === '') {
        Alert.alert('Select Morning Work Type');
      } else if (wtESdataLabel === '') {
        Alert.alert('Select Evening Work Type');
      } else if (wtdataLabel === 'WORKING' && usevisitWTData.length === 0) {
        Alert.alert('Select Morning Visit With');
      } else if (wtESdataLabel === 'WORKING' && usevisitWTDataES.length === 0) {
        Alert.alert('Select Evening Visit With');
      } else if (wtdataLabel !== 'WORKING' && useRemarks === '') {
        Alert.alert('Type Remarks');
      } else if (wtESdataLabel !== 'WORKING' && useRemarks === '') {
        Alert.alert('Type Remarks');
      } else {
        saveTP();
      }
    } else {
      if (usetourDateTest.length === 0) {
        Alert.alert('Select Tour Date');
      } else if (wtdataLabel === '') {
        Alert.alert('Select Morning Work Type');
      } else if (wtESdataLabel === '') {
        Alert.alert('Select Evening Work Type');
      } else if (wtdataLabel === 'WORKING' && selectedArea.length === 0) {
        Alert.alert('Select Morning Area');
      } else if (wtESdataLabel === 'WORKING' && selectedAreaES.length === 0) {
        Alert.alert('Select Evening Area');
      } else if (wtdataLabel !== 'WORKING' && useRemarks === '') {
        Alert.alert('Type Remarks');
      } else if (wtESdataLabel !== 'WORKING' && useRemarks === '') {
        Alert.alert('Type Remarks');
      } else {
        saveTP();
      }
    }
  };
  const saveTP = async () => {
    const empID = {IDEmployee: useIDEmployee};
    const EworkType = {IDMisc: wtESdataValue};
    const MworkType = {IDMisc: wtdataValue};

    //console.warn('Success');
    const data_api = {
      //IDTourProgram: 0,
      Employee: empID,
      // TourDate: selectedDateSend,
      TourDates: usetourDateTest,
      Remarks: useRemarks,
      MorningWorktype: MworkType,
      EveningWorktype: EworkType,
      MorningAreas: selectedAreaTest,
      EveningAreas: selectedAreaESTest,
      MorningDoctors: useDoctorDataTest,
      EveningDoctors: useDoctorDataESTest,
      MorningRetailers: useRetailerDataTest,
      EveningRetailers: useRetailerDataESTest,
      MorningVisitWith: usevisitWTDataTest,
      EveningVisitWith: usevisitWTDataESTest,
      CreatedBy: empEmail,
      Businessid: useBusinessID,
    };

    let result = await fetch(BASE_URL + 'TourProgram/addedit', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data_api),
    });

    result = await result.json();
    //console.log(result);
    //console.log(result.result);
    console.log(data_api);

    if (result.result === '') {
      Alert.alert(
        'Success',
        'Record Successfully Saved',
        [
          {
            text: 'Ok',
            onPress: () => props.navigation.navigate('Tour Plan Submission'),
          },
        ],
        {cancelable: false},
      );
    } else {
      Alert.alert(result.result);
    }
  };

  return (
    // <ImageBackground
    //   source={require('../images/bg2.png')}
    //   style={{height: Dimensions.get('window').height}}>
    <ScrollView
      style={{flex: 1, backgroundColor: false}}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      <SafeAreaView style={{padding: 15, margin: 15}}>
        <KeyboardAvoidingView
          behavior="padding"
          style={{justifyContent: 'space-between'}}>
          <TextInput
            label="Division"
            mode="outlined"
            autoCapitalize="none"
            autoCorrect={false}
            value={useDivision}
            editable={false}
            // style={[style.textInput, {marginBottom: 10}]}
            // placeholder="Division"
            // placeholderTextColor="#555"
            // mode="outlined"
            // autoCapitalize="none"
            // autoCorrect={false}
            // value={useDivision}
            // editable={false}
          />
          <TextInput
            label="Employee No"
            mode="outlined"
            autoCapitalize="none"
            autoCorrect={false}
            style={{marginTop: 5}}
            value={empNO}
            editable={false}
            // style={[style.textInput, {marginBottom: 10}]}
            // placeholder="Employee No"
            // placeholderTextColor="#555"
            // mode="outlined"
            // autoCapitalize="none"
            // autoCorrect={false}
            // value={empNO}
            // editable={false}
          />
          <TextInput
            label="Head Quarter"
            mode="outlined"
            autoCapitalize="none"
            autoCorrect={false}
            style={{marginTop: 5, marginBottom: 10}}
            value={useHQ}
            editable={false}
            // style={[style.textInput, {marginBottom: 10}]}
            // placeholder="Head Quarter"
            // placeholderTextColor="#555"
            // mode="outlined"
            // autoCapitalize="none"
            // autoCorrect={false}
            // value={useHQ}
            // editable={false}
          />

          {/* <MultipleSelectList
            setSelected={val => setTDData(val)}
            data={usetdDataSelected}
            placeholder="Select Tour Date"
            label="Tour Date"
            save="value"
            //save="key"
            onSelect={() =>
              //console.log(selectedArea)
              multiSelectTourDate()
            }
            fontFamily="Roboto-Bold"
            notFoundText="No Data Exists"
            //badgeTextStyles={{color:'red'}}
            badgeStyles={{backgroundColor: 'green'}}
            labelStyles={{fontWeight: '800', color: 'black'}}
          /> */}

          <MultiSelect
            style={style.dropdown}
            placeholderStyle={style.placeholderStyle}
            selectedTextStyle={style.selectedTextStyle}
            inputSearchStyle={style.inputSearchStyle}
            data={usetdDataSelected}
            labelField="value"
            valueField="value"
            placeholder="Select Tour Date"
            value={useTDData}
            onChange={item => {
              setTDData(item);
              multiSelectTourDate(item);
            }}
            search
            searchPlaceholder="Search..."
            renderItem={(item, selected) => (
              <View
                style={{
                  padding: 10,
                  backgroundColor: selected ? '#D3E3FC' : 'white', // Change color when selected
                }}>
                <Text>{item.value}</Text>
              </View>
            )}
          />
          <SafeAreaView style={style.container}>
            <View style={style.btnTab}>
              <Text style={style.textTab}>Morning Shift</Text>
            </View>
            <View>
              <Dropdown
                style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
                placeholderStyle={style.placeholderStyle}
                selectedTextStyle={style.selectedTextStyle}
                inputSearchStyle={style.inputSearchStyle}
                iconStyle={style.iconStyle}
                data={useWTData}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!isFocus ? 'Select Work Type' : '...'}
                searchPlaceholder="Search..."
                //value={wtdataLabel}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                  setwtdataValue(item.value);
                  setwtdataLabel(item.label);
                  // handleState(item.value);
                  setIsFocus(false);

                  if (item.label === 'WORKING') {
                    setshouldShowWT(true);
                  } else {
                    setshouldShowWT(false);
                  }
                }}
              />
              {useManagerAccess ? (
                <View>
                  {shouldShowWT ? (
                    <View>
                      {/* <MultipleSelectList
                        setSelected={val => setvisitWTData(val)}
                        data={usevisitWTDataSelected}
                        placeholder="Select Visit With"
                        label="Visit With"
                        //save="value"
                        save="key"
                        onSelect={() =>
                          //console.log(selectedArea)
                          multiSelectVisitWith()
                        }
                        fontFamily="Roboto-Bold"
                        notFoundText="No Data Exists"
                        //badgeTextStyles={{color:'red'}}
                        badgeStyles={{backgroundColor: 'green'}}
                        labelStyles={{fontWeight: '800', color: 'black'}}
                      />
                      <MultipleSelectList
                        setSelected={val => setSelectedArea(val)}
                        data={selectedAreaData}
                        placeholder="Select Area"
                        label="Area"
                        //save="value"
                        save="key"
                        onSelect={() =>
                          //console.log(selectedArea)
                          multiSelectList()
                        }
                        fontFamily="Roboto-Bold"
                        notFoundText="No Data Exists"
                        //badgeTextStyles={{color:'red'}}
                        badgeStyles={{backgroundColor: 'green'}}
                        labelStyles={{fontWeight: '800', color: 'black'}}
                      /> 
                       <MultipleSelectList
                        setSelected={val => setDoctorData(val)}
                        data={useDoctorDataSelected}
                        placeholder="Select Doctor"
                        label="Doctor"
                        //save="value"
                        save="key"
                        onSelect={() =>
                          //console.log(selectedArea)
                          multiSelectDoctor()
                        }
                        fontFamily="Roboto-Bold"
                        notFoundText="No Data Exists"
                        //badgeTextStyles={{color:'red'}}
                        badgeStyles={{backgroundColor: 'green'}}
                        labelStyles={{fontWeight: '800', color: 'black'}}
                      /> 
                       <MultipleSelectList
                        setSelected={val => setRetailerData(val)}
                        data={useRetailerDataSelected}
                        placeholder="Select Retailer"
                        label="Retailer"
                        //save="value"
                        save="key"
                        onSelect={() =>
                          //console.log(selectedArea)
                          multiSelectRetailer()
                        }
                        fontFamily="Roboto-Bold"
                        notFoundText="No Data Exists"
                        //badgeTextStyles={{color:'red'}}
                        badgeStyles={{backgroundColor: 'green'}}
                        labelStyles={{fontWeight: '800', color: 'black'}}
                      /> */}
                      <MultiSelect
                        style={style.dropdown}
                        placeholderStyle={style.placeholderStyle}
                        selectedTextStyle={style.selectedTextStyle}
                        inputSearchStyle={style.inputSearchStyle}
                        data={usevisitWTDataSelected}
                        labelField="label"
                        valueField="value"
                        placeholder="Select Visit With"
                        value={usevisitWTData}
                        onChange={item => {
                          setvisitWTData(item);
                          console.log(item);
                          multiSelectVisitWith(item);
                        }}
                        search
                        searchPlaceholder="Search..."
                        renderItem={(item, selected) => (
                          <View
                            style={{
                              padding: 10,
                              backgroundColor: selected ? '#D3E3FC' : 'white', // Change color when selected
                            }}>
                            <Text>{item.label}</Text>
                          </View>
                        )}
                      />
                      <MultiSelect
                        style={style.dropdown}
                        placeholderStyle={style.placeholderStyle}
                        selectedTextStyle={style.selectedTextStyle}
                        inputSearchStyle={style.inputSearchStyle}
                        data={selectedAreaData}
                        labelField="label"
                        valueField="value"
                        placeholder="Select Area"
                        value={selectedArea}
                        onChange={item => {
                          setSelectedArea(item);
                          multiSelectList(item);
                        }}
                        search
                        searchPlaceholder="Search..."
                        renderItem={(item, selected) => (
                          <View
                            style={{
                              padding: 10,
                              backgroundColor: selected ? '#D3E3FC' : 'white', // Change color when selected
                            }}>
                            <Text>{item.label}</Text>
                          </View>
                        )}
                      />
                      <MultiSelect
                        style={style.dropdown}
                        placeholderStyle={style.placeholderStyle}
                        selectedTextStyle={style.selectedTextStyle}
                        inputSearchStyle={style.inputSearchStyle}
                        data={useDoctorDataSelected}
                        labelField="label"
                        valueField="value"
                        placeholder="Select Doctor"
                        value={useDoctorData}
                        onChange={item => {
                          setDoctorData(item);
                          console.log(item);
                          multiSelectDoctor(item);
                        }}
                        search
                        searchPlaceholder="Search..."
                        renderItem={(item, selected) => (
                          <View
                            style={{
                              padding: 10,
                              backgroundColor: selected ? '#D3E3FC' : 'white', // Change color when selected
                            }}>
                            <Text>{item.label}</Text>
                          </View>
                        )}
                      />
                      <MultiSelect
                        style={style.dropdown}
                        placeholderStyle={style.placeholderStyle}
                        selectedTextStyle={style.selectedTextStyle}
                        inputSearchStyle={style.inputSearchStyle}
                        data={useRetailerDataSelected}
                        labelField="label"
                        valueField="value"
                        placeholder="Select Retailer"
                        value={useRetailerData}
                        onChange={item => {
                          setRetailerData(item);
                          console.log(item);
                          multiSelectRetailer(item);
                        }}
                        search
                        searchPlaceholder="Search..."
                        renderItem={(item, selected) => (
                          <View
                            style={{
                              padding: 10,
                              backgroundColor: selected ? '#D3E3FC' : 'white', // Change color when selected
                            }}>
                            <Text>{item.label}</Text>
                          </View>
                        )}
                      />
                    </View>
                  ) : null}
                </View>
              ) : (
                <View>
                  {shouldShowWT ? (
                    <View>
                      <MultiSelect
                        style={style.dropdown}
                        placeholderStyle={style.placeholderStyle}
                        selectedTextStyle={style.selectedTextStyle}
                        inputSearchStyle={style.inputSearchStyle}
                        data={selectedAreaData}
                        labelField="label"
                        valueField="value"
                        placeholder="Select Area"
                        value={selectedArea}
                        onChange={item => {
                          setSelectedArea(item);
                          multiSelectList(item);
                        }}
                        search
                        searchPlaceholder="Search..."
                        renderItem={(item, selected) => (
                          <View
                            style={{
                              padding: 10,
                              backgroundColor: selected ? '#D3E3FC' : 'white', // Change color when selected
                            }}>
                            <Text>{item.label}</Text>
                          </View>
                        )}
                      />
                      <MultiSelect
                        style={style.dropdown}
                        placeholderStyle={style.placeholderStyle}
                        selectedTextStyle={style.selectedTextStyle}
                        inputSearchStyle={style.inputSearchStyle}
                        data={useDoctorDataSelected}
                        labelField="label"
                        valueField="value"
                        placeholder="Select Doctor"
                        value={useDoctorData}
                        onChange={item => {
                          setDoctorData(item);
                          console.log(item);
                          multiSelectDoctor(item);
                        }}
                        search
                        searchPlaceholder="Search..."
                        renderItem={(item, selected) => (
                          <View
                            style={{
                              padding: 10,
                              backgroundColor: selected ? '#D3E3FC' : 'white', // Change color when selected
                            }}>
                            <Text>{item.label}</Text>
                          </View>
                        )}
                      />
                      <MultiSelect
                        style={style.dropdown}
                        placeholderStyle={style.placeholderStyle}
                        selectedTextStyle={style.selectedTextStyle}
                        inputSearchStyle={style.inputSearchStyle}
                        data={useRetailerDataSelected}
                        labelField="label"
                        valueField="value"
                        placeholder="Select Retailer"
                        value={useRetailerData}
                        onChange={item => {
                          setRetailerData(item);
                          console.log(item);
                          multiSelectRetailer(item);
                        }}
                        search
                        searchPlaceholder="Search..."
                        renderItem={(item, selected) => (
                          <View
                            style={{
                              padding: 10,
                              backgroundColor: selected ? '#D3E3FC' : 'white', // Change color when selected
                            }}>
                            <Text>{item.label}</Text>
                          </View>
                        )}
                      />
                      <MultiSelect
                        style={style.dropdown}
                        placeholderStyle={style.placeholderStyle}
                        selectedTextStyle={style.selectedTextStyle}
                        inputSearchStyle={style.inputSearchStyle}
                        data={usevisitWTDataSelected}
                        labelField="label"
                        valueField="value"
                        placeholder="Select Visit With"
                        value={usevisitWTData}
                        onChange={item => {
                          setvisitWTData(item);
                          console.log(item);
                          multiSelectVisitWith(item);
                        }}
                        search
                        searchPlaceholder="Search..."
                        renderItem={(item, selected) => (
                          <View
                            style={{
                              padding: 10,
                              backgroundColor: selected ? '#D3E3FC' : 'white', // Change color when selected
                            }}>
                            <Text>{item.label}</Text>
                          </View>
                        )}
                      />
                      {/* <MultipleSelectList
                        setSelected={val => setSelectedArea(val)}
                        data={selectedAreaData}
                        placeholder="Select Area"
                        label="Area"
                        //save="value"
                        save="key"
                        onSelect={() =>
                          //console.log(selectedArea)
                          multiSelectList()
                        }
                        fontFamily="Roboto-Bold"
                        notFoundText="No Data Exists"
                        //badgeTextStyles={{color:'red'}}
                        badgeStyles={{backgroundColor: 'green'}}
                        labelStyles={{fontWeight: '800', color: 'black'}}
                      /> 
                      <MultipleSelectList
                        setSelected={val => setDoctorData(val)}
                        data={useDoctorDataSelected}
                        placeholder="Select Doctor"
                        label="Doctor"
                        //save="value"
                        save="key"
                        onSelect={() =>
                          //console.log(selectedArea)
                          multiSelectDoctor()
                        }
                        fontFamily="Roboto-Bold"
                        notFoundText="No Data Exists"
                        //badgeTextStyles={{color:'red'}}
                        badgeStyles={{backgroundColor: 'green'}}
                        labelStyles={{fontWeight: '800', color: 'black'}}
                      /> 
                       <MultipleSelectList
                        setSelected={val => setRetailerData(val)}
                        data={useRetailerDataSelected}
                        placeholder="Select Retailer"
                        label="Retailer"
                        //save="value"
                        save="key"
                        onSelect={() =>
                          //console.log(selectedArea)
                          multiSelectRetailer()
                        }
                        fontFamily="Roboto-Bold"
                        notFoundText="No Data Exists"
                        //badgeTextStyles={{color:'red'}}
                        badgeStyles={{backgroundColor: 'green'}}
                        labelStyles={{fontWeight: '800', color: 'black'}}
                      /> 
                      <MultipleSelectList
                        setSelected={val => setvisitWTData(val)}
                        data={usevisitWTDataSelected}
                        placeholder="Select Visit With"
                        label="Visit With"
                        //save="value"
                        save="key"
                        onSelect={() =>
                          //console.log(selectedArea)
                          multiSelectVisitWith()
                        }
                        fontFamily="Roboto-Bold"
                        notFoundText="No Data Exists"
                        //badgeTextStyles={{color:'red'}}
                        badgeStyles={{backgroundColor: 'green'}}
                        labelStyles={{fontWeight: '800', color: 'black'}}
                      />*/}
                    </View>
                  ) : null}
                </View>
              )}

              <View style={style.btnTab}>
                <Text style={style.textTab}>Evening Shift</Text>
              </View>
              <Dropdown
                style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
                placeholderStyle={style.placeholderStyle}
                selectedTextStyle={style.selectedTextStyle}
                inputSearchStyle={style.inputSearchStyle}
                iconStyle={style.iconStyle}
                data={useWTESData}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!isFocus ? 'Select Work Type' : '...'}
                searchPlaceholder="Search..."
                //value={wtdataLabel}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                  setWTESdataValue(item.value);
                  setWTESdataLabel(item.label);
                  // handleState(item.value);
                  setIsFocus(false);

                  if (item.label === 'WORKING') {
                    setshouldShowESWT(true);
                  } else {
                    setshouldShowESWT(false);
                  }
                }}
              />

              {useManagerAccess ? (
                <View>
                  {shouldShowESWT ? (
                    <View>
                      {/* <MultipleSelectList
                        setSelected={val => setvisitWTDataES(val)}
                        data={usevisitWTDataSelectedES}
                        placeholder="Select Visit With"
                        label="Visit With"
                        //save="value"
                        save="key"
                        onSelect={() =>
                          //console.log(selectedArea)
                          multiSelectVisitWithES()
                        }
                        fontFamily="Roboto-Bold"
                        notFoundText="No Data Exists"
                        //badgeTextStyles={{color:'red'}}
                        badgeStyles={{backgroundColor: 'green'}}
                        labelStyles={{fontWeight: '800', color: 'black'}}
                      />
                      <MultipleSelectList
                        setSelected={val => setSelectedAreaES(val)}
                        data={selectedAreaDataES}
                        placeholder="Select Area"
                        label="Area"
                        //save="value"
                        save="key"
                        onSelect={() =>
                          //console.log(selectedArea)
                          multiSelectListES()
                        }
                        fontFamily="Roboto-Bold"
                        notFoundText="No Data Exists"
                        //badgeTextStyles={{color:'red'}}
                        badgeStyles={{backgroundColor: 'green'}}
                        labelStyles={{fontWeight: '800', color: 'black'}}
                      />
                      <MultipleSelectList
                        setSelected={val => setDoctorDataES(val)}
                        data={useDoctorDataSelectedES}
                        placeholder="Select Doctor"
                        label="Doctor"
                        //save="value"
                        save="key"
                        onSelect={() =>
                          //console.log(selectedArea)
                          multiSelectDoctorES()
                        }
                        fontFamily="Roboto-Bold"
                        notFoundText="No Data Exists"
                        //badgeTextStyles={{color:'red'}}
                        badgeStyles={{backgroundColor: 'green'}}
                        labelStyles={{fontWeight: '800', color: 'black'}}
                      />
                      <MultipleSelectList
                        setSelected={val => setRetailerDataES(val)}
                        data={useRetailerDataSelectedES}
                        placeholder="Select Retailer"
                        label="Retailer"
                        //save="value"
                        save="key"
                        onSelect={() =>
                          //console.log(selectedArea)
                          multiSelectRetailerES()
                        }
                        fontFamily="Roboto-Bold"
                        notFoundText="No Data Exists"
                        //badgeTextStyles={{color:'red'}}
                        badgeStyles={{backgroundColor: 'green'}}
                        labelStyles={{fontWeight: '800', color: 'black'}}
                      /> */}
                      <MultiSelect
                        style={style.dropdown}
                        placeholderStyle={style.placeholderStyle}
                        selectedTextStyle={style.selectedTextStyle}
                        inputSearchStyle={style.inputSearchStyle}
                        data={usevisitWTDataSelectedES}
                        labelField="label"
                        valueField="value"
                        placeholder="Select Visit With"
                        value={usevisitWTDataES}
                        onChange={item => {
                          setvisitWTDataES(item);
                          console.log(item);
                          multiSelectVisitWithES(item);
                        }}
                        search
                        searchPlaceholder="Search..."
                        renderItem={(item, selected) => (
                          <View
                            style={{
                              padding: 10,
                              backgroundColor: selected ? '#D3E3FC' : 'white', // Change color when selected
                            }}>
                            <Text>{item.label}</Text>
                          </View>
                        )}
                      />

                      <MultiSelect
                        style={style.dropdown}
                        placeholderStyle={style.placeholderStyle}
                        selectedTextStyle={style.selectedTextStyle}
                        inputSearchStyle={style.inputSearchStyle}
                        data={selectedAreaDataES}
                        labelField="label"
                        valueField="value"
                        placeholder="Select Area"
                        value={selectedAreaES}
                        onChange={item => {
                          setSelectedAreaES(item);
                          multiSelectListES(item);
                        }}
                        search
                        searchPlaceholder="Search..."
                        renderItem={(item, selected) => (
                          <View
                            style={{
                              padding: 10,
                              backgroundColor: selected ? '#D3E3FC' : 'white', // Change color when selected
                            }}>
                            <Text>{item.label}</Text>
                          </View>
                        )}
                      />
                      <MultiSelect
                        style={style.dropdown}
                        placeholderStyle={style.placeholderStyle}
                        selectedTextStyle={style.selectedTextStyle}
                        inputSearchStyle={style.inputSearchStyle}
                        data={useDoctorDataSelectedES}
                        labelField="label"
                        valueField="value"
                        placeholder="Select Doctor"
                        value={useDoctorDataES}
                        onChange={item => {
                          setDoctorDataES(item);
                          console.log(item);
                          multiSelectDoctorES(item);
                        }}
                        search
                        searchPlaceholder="Search..."
                        renderItem={(item, selected) => (
                          <View
                            style={{
                              padding: 10,
                              backgroundColor: selected ? '#D3E3FC' : 'white', // Change color when selected
                            }}>
                            <Text>{item.label}</Text>
                          </View>
                        )}
                      />
                      <MultiSelect
                        style={style.dropdown}
                        placeholderStyle={style.placeholderStyle}
                        selectedTextStyle={style.selectedTextStyle}
                        inputSearchStyle={style.inputSearchStyle}
                        data={useRetailerDataSelectedES}
                        labelField="label"
                        valueField="value"
                        placeholder="Select Retailer"
                        value={useRetailerDataES}
                        onChange={item => {
                          setRetailerDataES(item);
                          console.log(item);
                          multiSelectRetailerES(item);
                        }}
                        search
                        searchPlaceholder="Search..."
                        renderItem={(item, selected) => (
                          <View
                            style={{
                              padding: 10,
                              backgroundColor: selected ? '#D3E3FC' : 'white', // Change color when selected
                            }}>
                            <Text>{item.label}</Text>
                          </View>
                        )}
                      />
                    </View>
                  ) : null}
                </View>
              ) : (
                <View>
                  {shouldShowESWT ? (
                    <View>
                      {/* <MultipleSelectList
                        setSelected={val => setSelectedAreaES(val)}
                        data={selectedAreaDataES}
                        placeholder="Select Area"
                        label="Area"
                        //save="value"
                        save="key"
                        onSelect={() =>
                          //console.log(selectedArea)
                          multiSelectListES()
                        }
                        fontFamily="Roboto-Bold"
                        notFoundText="No Data Exists"
                        //badgeTextStyles={{color:'red'}}
                        badgeStyles={{backgroundColor: 'green'}}
                        labelStyles={{fontWeight: '800', color: 'black'}}
                      />
                      <MultipleSelectList
                        setSelected={val => setDoctorDataES(val)}
                        data={useDoctorDataSelectedES}
                        placeholder="Select Doctor"
                        label="Doctor"
                        //save="value"
                        save="key"
                        onSelect={() =>
                          //console.log(selectedArea)
                          multiSelectDoctorES()
                        }
                        fontFamily="Roboto-Bold"
                        notFoundText="No Data Exists"
                        //badgeTextStyles={{color:'red'}}
                        badgeStyles={{backgroundColor: 'green'}}
                        labelStyles={{fontWeight: '800', color: 'black'}}
                      />
                      <MultipleSelectList
                        setSelected={val => setRetailerDataES(val)}
                        data={useRetailerDataSelectedES}
                        placeholder="Select Retailer"
                        label="Retailer"
                        //save="value"
                        save="key"
                        onSelect={() =>
                          //console.log(selectedArea)
                          multiSelectRetailerES()
                        }
                        fontFamily="Roboto-Bold"
                        notFoundText="No Data Exists"
                        //badgeTextStyles={{color:'red'}}
                        badgeStyles={{backgroundColor: 'green'}}
                        labelStyles={{fontWeight: '800', color: 'black'}}
                      />
                      <MultipleSelectList
                        setSelected={val => setvisitWTDataES(val)}
                        data={usevisitWTDataSelectedES}
                        placeholder="Select Visit With"
                        label="Visit With"
                        //save="value"
                        save="key"
                        onSelect={() =>
                          //console.log(selectedArea)
                          multiSelectVisitWithES()
                        }
                        fontFamily="Roboto-Bold"
                        notFoundText="No Data Exists"
                        //badgeTextStyles={{color:'red'}}
                        badgeStyles={{backgroundColor: 'green'}}
                        labelStyles={{fontWeight: '800', color: 'black'}}
                      /> */}

                      <MultiSelect
                        style={style.dropdown}
                        placeholderStyle={style.placeholderStyle}
                        selectedTextStyle={style.selectedTextStyle}
                        inputSearchStyle={style.inputSearchStyle}
                        data={selectedAreaDataES}
                        labelField="label"
                        valueField="value"
                        placeholder="Select Area"
                        value={selectedAreaES}
                        onChange={item => {
                          setSelectedAreaES(item);
                          multiSelectListES(item);
                        }}
                        search
                        searchPlaceholder="Search..."
                        renderItem={(item, selected) => (
                          <View
                            style={{
                              padding: 10,
                              backgroundColor: selected ? '#D3E3FC' : 'white', // Change color when selected
                            }}>
                            <Text>{item.label}</Text>
                          </View>
                        )}
                      />
                      <MultiSelect
                        style={style.dropdown}
                        placeholderStyle={style.placeholderStyle}
                        selectedTextStyle={style.selectedTextStyle}
                        inputSearchStyle={style.inputSearchStyle}
                        data={useDoctorDataSelectedES}
                        labelField="label"
                        valueField="value"
                        placeholder="Select Doctor"
                        value={useDoctorDataES}
                        onChange={item => {
                          setDoctorDataES(item);
                          console.log(item);
                          multiSelectDoctorES(item);
                        }}
                        search
                        searchPlaceholder="Search..."
                        renderItem={(item, selected) => (
                          <View
                            style={{
                              padding: 10,
                              backgroundColor: selected ? '#D3E3FC' : 'white', // Change color when selected
                            }}>
                            <Text>{item.label}</Text>
                          </View>
                        )}
                      />
                      <MultiSelect
                        style={style.dropdown}
                        placeholderStyle={style.placeholderStyle}
                        selectedTextStyle={style.selectedTextStyle}
                        inputSearchStyle={style.inputSearchStyle}
                        data={useRetailerDataSelectedES}
                        labelField="label"
                        valueField="value"
                        placeholder="Select Retailer"
                        value={useRetailerDataES}
                        onChange={item => {
                          setRetailerDataES(item);
                          console.log(item);
                          multiSelectRetailerES(item);
                        }}
                        search
                        searchPlaceholder="Search..."
                        renderItem={(item, selected) => (
                          <View
                            style={{
                              padding: 10,
                              backgroundColor: selected ? '#D3E3FC' : 'white', // Change color when selected
                            }}>
                            <Text>{item.label}</Text>
                          </View>
                        )}
                      />
                      <MultiSelect
                        style={style.dropdown}
                        placeholderStyle={style.placeholderStyle}
                        selectedTextStyle={style.selectedTextStyle}
                        inputSearchStyle={style.inputSearchStyle}
                        data={usevisitWTDataSelectedES}
                        labelField="label"
                        valueField="value"
                        placeholder="Select Visit With"
                        value={usevisitWTDataES}
                        onChange={item => {
                          setvisitWTDataES(item);
                          console.log(item);
                          multiSelectVisitWithES(item);
                        }}
                        search
                        searchPlaceholder="Search..."
                        renderItem={(item, selected) => (
                          <View
                            style={{
                              padding: 10,
                              backgroundColor: selected ? '#D3E3FC' : 'white', // Change color when selected
                            }}>
                            <Text>{item.label}</Text>
                          </View>
                        )}
                      />
                    </View>
                  ) : null}
                </View>
              )}
            </View>
          </SafeAreaView>
          <TextInput
            label="Remarks"
            mode="outlined"
            autoCapitalize="none"
            autoCorrect={false}
            value={useRemarks}
            onChangeText={actualData => setRemarks(actualData)}
            // mode="outlined"
            // autoCapitalize="none"
            // autoCorrect={false}
            // style={[style.textInput, {marginBottom: 5}]}
            // placeholder="Remarks"
            // placeholderTextColor="#555"
            // value={useRemarks}
            // onChangeText={actualData => setRemarks(actualData)}
          />
          <CustomButton label={'Save'} onPress={() => save()} />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScrollView>
    // </ImageBackground>
  );
};

export default TourProgScreen;

const style = StyleSheet.create({
  container: {
    marginTop: 10,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  listTab: {
    flexDirection: 'row',
    //alignSelf: 'center',
    marginBottom: 10,
    backgroundColor: '#33767C',
  },
  textTab: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Lato-Bold',
  },
  textTabActive: {
    color: '#fff',
  },
  btnTab: {
    width: Dimensions.get('window').width / 1.5,
    flexDirection: 'row',
    borderWidth: 0.5,
    borderColor: '#EBEBEB',
    padding: 10,
    //justifyContent: 'center',
    backgroundColor: '#E6838D',
    marginBottom: 10,
  },

  btnTabActive: {
    backgroundColor: '#E6838D',
  },
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  dropdownManger: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    marginBottom: 5,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#aaa',
  },
  selectedTextStyle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#000',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  selectedStyle: {
    borderRadius: 12,
  },
  itemContainer: {
    flexDirection: 'row',
    paddingVertical: 15,
  },
  itemLogo: {
    padding: 10,
  },
  itemImage: {
    width: 50,
    height: 50,
  },
  itemName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#000', // Border color
    borderRadius: 8, // Rounded corners
    padding: 10, // Inner padding
    fontSize: 16,
  },
  itemBody: {
    flex: 1,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  itemStatus: {
    backgroundColor: 'green',
    paddingHorizontal: 6,
    justifyContent: 'center',
    right: 12,
  },
});
