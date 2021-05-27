import React, { useState, useEffect, useContext }  from "react";
import { Row, Col, Modal, Form, Spinner } from "react-bootstrap";
import { Link } from 'react-router-dom';
import search from '../assets/search.svg';
import logo from '../assets/logo.png';
import logoW from '../assets/logo-white.png';
import Swal from 'sweetalert2'
import { Web3Context } from "../web3";

export default function Header(props) {
  const { connectWeb3, account, logout, isOwner, newOwner, removeOwner } = useContext(Web3Context);

  const [auth, setAuth] = useState(false);
  const [owner, setOwner] = useState("");
  const [add, setAdd] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showResponsiveMenu, setShowResponsiveMenu] = useState(false);

  const make = async () => {
    setLoading(true);
    try {
      await newOwner(owner);
      Swal.fire({
        title: 'Added!',
        icon: 'success',
        text: '',
      })
      setLoading(false)
    } catch (error) {
      if(error.message === "MetaMask Tx Signature: User denied transaction signature."){
        Swal.fire(
          'Transaction signature denied',
          '',
          'error'
        )
      }else{
        Swal.fire(
          error.message,
          '',
          'error'
        )
      }
      setLoading(false)
      setOwner("")
    }
  }

  const unmake = async () => {
    setLoading(true);
    try {
      await removeOwner(owner);
      Swal.fire({
        title: 'Removed!',
        icon: 'success',
        text: '',
      })
      setLoading(false)
    } catch (error) {
      if(error.message === "MetaMask Tx Signature: User denied transaction signature."){
        Swal.fire(
          'Transaction signature denied',
          '',
          'error'
        )
      }else{
        Swal.fire(
          error.message,
          '',
          'error'
        )
      }
      setLoading(false)
      setOwner("")
    }
  }

  const abrir = (opt) => {
    setShowModal(true);
    setAdd(opt);
  }

  useEffect(() => {
    isOwner().then(resp => {
      setAuth(resp)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account])

  return (
    <>
      {window.innerWidth < 768 ? 
        <>
          <div className={`header-responsive-menu ${showResponsiveMenu ? "active": ""}`}>
            {showResponsiveMenu && 
              <>
                <Row className="mx-0" style={{height: '7vh'}}>
                  <div className="super-center" style={{width: '70%', padding: 10}}>
                    <Link to="/">
                      <img src={logoW} alt="" style={{width: '80%', minHeigth: '40px'}}/>
                    </Link>
                  </div>
                  <div className="super-center" style={{width: '30%'}}>
                    <i className="fas fa-times m-auto" style={{fontSize: '2.5rem'}} onClick={()=>setShowResponsiveMenu(false)}></i>
                  </div>
                </Row>
                <div className="super-center w-100" style={{height: '93vh'}}>
                  <div style={{width: '90%', fontSize: '1.4rem'}}>
                    {auth && <>
                      <div className="p-0 mx-3 my-5" style={{cursor: "pointer"}} onClick={()=>abrir(true)}>
                        add owner
                      </div>
                      <div className="p-0 mx-3 my-5" style={{cursor: "pointer"}} onClick={()=>abrir(false)}>
                        remove owner
                      </div>
                    </>}
                    <div className="p-0 mx-3 my-5">
                      {account ? 
                        <button className="platform-button" onClick={logout}>Logout</button>
                      :
                        <button className="platform-button" onClick={connectWeb3}>Sign in</button>
                      }
                    </div>
                  </div>
                </div>
              </>
            }
          </div>
          <Row className="mx-0" style={{height: '8vh'}}>
            <div className="super-center" style={{width: '70%'}}>
              <Link to="/">
                <img src={logo} alt="" style={{width: '80%'}}/>
              </Link>
            </div>
            <div className="super-center" style={{width: '30%'}}>
              <i className="fas fa-bars m-auto" style={{fontSize: '2.5rem'}} onClick={()=>setShowResponsiveMenu(true)}></i>
            </div>
            <Col sm={10} className="mx-auto super-center">
              <input className="header-search" type="text" onChange={props.doSearch} placeholder="Search your NFT"/>
              <span style={{marginLeft: '-30px'}}><img src={search} alt="" style={{width: '24px', height: '24px'}}/></span>
            </Col>
          </Row>
        </>
      :
        <Row className="header-container mx-0">
          <Col sm={3} className="super-center">
            <Link to="/">
              <img src={logo} alt="" style={{width: '150px', minHeigth: '40px'}}/>
            </Link>
          </Col>
          <Col sm={5} className="super-center" style={{justifyContent: 'flex-start'}}>
            <input className="header-search" type="text" onChange={props.doSearch} placeholder="Search your NFT"/>
            <span style={{marginLeft: '-30px'}}><img src={search} alt="" style={{width: '24px', height: '24px'}}/></span>
          </Col>
          <Col sm={4} className="super-center" style={{justifyContent: 'flex-end'}}>
            {auth && <>
              <div className="p-0 mx-3" style={{cursor: "pointer"}} onClick={()=>abrir(true)}>
                add owner
              </div>
              <div className="p-0 mx-3" style={{cursor: "pointer"}} onClick={()=>abrir(false)}>
                remove owner
              </div>
            </>}
            <div className="p-0 mx-3">
              {account ? 
                <button className="platform-button" onClick={logout}>Logout</button>
              :
                <button className="platform-button" onClick={connectWeb3}>Sign in</button>
              }
            </div>
          </Col>
        </Row>
      }

      <Modal show={showModal} onHide={()=>setShowModal(false)} centered>
        <Modal.Body>
          <Row style={{height: '50px'}}>
            <div onClick={()=>setShowModal(false)} style={{fontSize: '1.6rem', cursor: "pointer", marginLeft: 'auto', marginRight: '1rem'}}><i className="far fa-times-circle"></i></div>
          </Row>
          <Form.Group>
            <Form.Label>Address</Form.Label>
            <Form.Control type="text" onChange={(e)=>setOwner(e.target.value)} style={{backgroundColor: '#F8F9FA', height: '40px', borderRadius: '4px'}} value={owner}/>
          </Form.Group>
          <div className='text-center'>
            
            {add ? 
              <button className="platform-button mx-2" onClick={make} disabled={loading} style={{backgroundColor: '#35FFD4', border: "none"}}>
                {loading ? <Spinner size="sm" animation="grow" variant="light"/>: "Add"}
              </button>
            :
              <button className="platform-button mx-2" onClick={unmake} disabled={loading} style={{backgroundColor: '#35FFD4', border: "none"}}>
                {loading ? <Spinner size="sm" animation="grow" variant="light"/>: "Remove"}
              </button>
            }
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
