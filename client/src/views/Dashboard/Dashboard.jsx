import React, {useEffect} from "react";
import { Link } from 'react-router-dom';
import { Row, Col } from "react-bootstrap";

// COMPONENTS
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import DashboardLogic from './DashboardLogic';

const Dashboard = () => {
  const {
    getData,
    doSearch,
    search,
    myNFTs,
    // filters,
    // account
  } = DashboardLogic();

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  return (
    <div className="container-app">
      <Header dashboard={true} doSearch={doSearch} search={search}/>
      <Row className="m-0 p-0 main-section">
        {/* <Sidebar dashboard={true} filters={filters}/> */}
        <Row className='dashboard-items-container'>
          {myNFTs.map((element, key) => (
            <Link to={`/item/${element.id}`} className="dashboard-item-card" key={key} style={{textDecoration: 'none'}}>
              <div className='dashboard-item-card-picture'>
                <img src={element.data.image} alt="" style={{width: '100%', height: '100%', borderTopLeftRadius: '10px', borderTopRightRadius: '10px', objectFit: 'cover'}}/>
              </div>
              <Row className='dashboard-item-card-body m-0'>
                <p className="p-0 m-0" style={{color: '#212529', fontWeight: 'bold', fontSize: '0.8rem', width: '100%', height: '20%'}}>Owner</p>
                <p className="p-0 m-0" style={{color: '#212529', fontSize: '1rem', width: '100%', height: '20%'}}>{element.data.name}</p>
                <p className="p-0 m-0" style={{fontSize: '0.8rem', color: '#777', width: '100%', height: '40%'}}>{element.data.description}</p>
                <Col sm={12} className="m-0 p-0 mt-auto">
                  <Row className="m-0 p-0">
                    <Col sm={6} className="m-0 p-0 text-left">
                      <p className="p-0 m-0" style={{color: '#212529', fontSize:'0.8rem'}}>Amount: {element.amount}</p>
                    </Col>
                    <Col sm={6} className="m-0 p-0 text-right">
                      {/* <p className="p-0 m-0" style={{fontSize:'0.8rem'}}>ETH</p> */}
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Link>
          ))}
        </Row>
      </Row>
      <Footer/>
    </div>
  );
}

export default Dashboard;