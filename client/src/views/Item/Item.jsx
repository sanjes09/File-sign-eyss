import React from "react";
import { Row, Col, Spinner, Button, Modal, Form } from "react-bootstrap";
import './Item.css';

// COMPONENTS
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ItemLogic from './ItemLogic';

const Item = () => {
  const {
    buy,
    sell,
    setSellAmount,
    setSellPrice,
    setShowModal,
    view,
    setShowModalTransfer,
    setTransferTo,
    setTransferAmount,
    showModalTransfer,
    transfer,
    transferTo,
    transferAmount,
    isItemOwner,
    account,
    showModal,
    loadingBuy,
    loadingSell,
    loading,
    item,
    sellOffers,
    sellPrice,
    sellAmount,
    loadingTransfer,
    itemPrice,
    metadata
  } = ItemLogic();

  return (
    <div className="container-app">
      <Header/>
      <Row className="m-0 p-0 main-section">
        <Row className='item-container-1'>
        {loading ?
          <div className='p-4 m-auto'>
            <Spinner animation="grow" variant="primary" style={{marginRight: '0.5rem'}}/>
          </div>
          :
          <div className="item-container row p-3">
            <Col sm={12} md={6}>
              <div className="my-3 mx-auto item-card-photo" style={{width: '80%'}}>
                <div style={{border: '1px solid', padding: "10px", borderRadius: '10px'}}>
                  <img src={item?.data?.image} alt="" style={{width: '100%', height: '100%'}}/>
                </div>
                <p className='mt-2' style={{cursor: 'pointer', color: "blue", textDecoration: 'underline'}} onClick={view}>View on OpenSea</p>
              </div>
            </Col>
            <Col sm={12} md={6}>
              <p style={{fontSize: '0.8rem', fontWeight: 'bold'}}>Owner</p>
              <p style={{fontSize: '1.2rem', fontWeight: 'bold'}}>{item?.data?.name}</p>
              <p style={{fontSize: '1rem', color: "grey"}}>{item?.data?.description}</p>
              <p style={{fontSize: '0.9rem', fontWeight: 'bold', marginTop: '3rem'}}>Metadata JSON: </p>
              <p style={{fontSize: '1rem', color: "grey"}}><a href={metadata} target="_blank" style={{wordBreak: 'break-all'}}>{metadata}</a></p>
              <p style={{fontSize: '1rem', fontWeight: 'bold', marginTop: "3rem", marginBottom: 0}}>Properties: </p>
              <div className="">
                {item?.data?.attributes?.map((element,key) => (
                  element.trait_type !== "Token amount" &&
                  <p key={key} style={{margin: 0, color: "grey"}}>{element.trait_type}: {element.value}</p>
                ))}
              </div>
              <div className="item-card p-0">
                <Row className="mb-4 p-0">
                  <Col>
                    {item?.data?.attributes?.map((element,key) => (
                      element.trait_type === "Token amount" &&
                      <p key={key} style={{margin: 0}}><span style={{fontWeight: "bold"}}>Amount:</span> {element.value}</p>
                    ))}
                  </Col>
                  <Col className="text-right">
                    {itemPrice} ETH
                  </Col>
                </Row>

                <p className="text-center" style={{fontSize: '1.3rem', fontWeight: 'bold'}}>Sell Offers</p>

                <Row className="p-0 m-0 sell-offers">
                  <Col sm={4} style={{textDecoration: 'underline', fontWeight: 'bold',width: "30%"}}>Unit price</Col>
                  <Col sm={3} style={{textDecoration: 'underline', fontWeight: 'bold',width: "25%"}}>Quantity</Col>
                  <Col sm={4} style={{textDecoration: 'underline', fontWeight: 'bold',width: "30%"}}>Total price</Col>
                </Row>
                {sellOffers?.map((element, key) => (
                  <Row key={key} className="p-0 m-0 py-2 sell-offers">
                    <Col sm={4} className="super-center" style={{width: '30%'}}>{((Number(element.currentPrice)/(10**18))/Number(element.quantity)).toFixed(2)} ETH</Col>
                    <Col sm={3} className="super-center" style={{width: '25%'}}>{Number(element.quantity)}</Col>
                    <Col sm={4} className="super-center" style={{width: '30%'}}>{Number(element.currentPrice)/(10**18)} ETH</Col>
                    <Col sm={1} className="super-center" style={{width: '15%'}}>
                      {(!account || element.maker !== account.toLowerCase()) && 
                        <Button variant="success" size="sm" onClick={()=>buy(element)} disabled={loadingBuy}>
                          {loadingBuy ? <Spinner size="sm" animation="grow" variant="light"/>: "Buy"}
                        </Button>
                      }
                    </Col>
                  </Row>
                ))}

                {isItemOwner && 
                  <Row className="p-0 m-0 py-2 sell-transfer-buttons" style={{}}>
                    <button className="platform-button mx-2" onClick={()=>setShowModal(true)} disabled={loadingSell}>
                      {loadingSell ? <Spinner size="sm" animation="grow" variant="dark"/>: "Sell"}
                    </button>
                    <button className="platform-button-revert mx-2"  onClick={()=>setShowModalTransfer(true)} disabled={loadingSell}>
                      {loadingSell ? <Spinner size="sm" animation="grow" variant="light"/>: "Transfer"}
                    </button>
                  </Row>
                }
              </div>
            </Col>
          </div>
        }
        </Row>
      </Row>
      <Footer/>

      <Modal show={showModal} onHide={()=>setShowModal(false)} size="sm" centered>
        <Modal.Body>
          <Row style={{height: '50px'}}>
            <div onClick={()=>setShowModal(false)} style={{fontSize: '1.6rem', cursor: "pointer", marginLeft: 'auto', marginRight: '1rem'}}><i className="far fa-times-circle"></i></div>
          </Row>
          <Form.Group>
            <Form.Label>Sell Price</Form.Label>
            <Form.Control type="number" onChange={(e)=>setSellPrice(e.target.value)} style={{backgroundColor: '#F8F9FA'}} value={sellPrice}/>
          </Form.Group>
          <Form.Group>
            <Form.Label>Sell Amount</Form.Label>
            <Form.Control type="number" onChange={(e)=>setSellAmount(e.target.value)} style={{backgroundColor: '#F8F9FA'}} value={sellAmount}/>
          </Form.Group>
          <div className='text-center'>
            <button className="platform-button mx-2" onClick={()=>sell()} disabled={loadingSell} style={{backgroundColor: '#35FFD4', border: "none"}}>
              {loadingSell ? <Spinner size="sm" animation="grow" variant="dark"/>: "Sell"}
            </button>
          </div>
        </Modal.Body>
      </Modal>

      <Modal show={showModalTransfer} onHide={()=>setShowModalTransfer(false)} size="sm" centered>
        <Modal.Body>
          <Row style={{height: '50px'}}>
            <div onClick={()=>setShowModalTransfer(false)} style={{fontSize: '1.6rem', cursor: "pointer", marginLeft: 'auto', marginRight: '1rem'}}><i className="far fa-times-circle"></i></div>
          </Row>
          <Form.Group>
            <Form.Label>Address</Form.Label>
            <Form.Control type="text" onChange={(e)=>setTransferTo(e.target.value)} style={{backgroundColor: '#F8F9FA'}} value={transferTo}/>
          </Form.Group>
          <Form.Group>
            <Form.Label>Amount of tokens</Form.Label>
            <Form.Control type="number" onChange={(e)=>setTransferAmount(e.target.value)} style={{backgroundColor: '#F8F9FA'}} value={transferAmount}/>
          </Form.Group>
          <div className='text-center'>
            <button className="platform-button mx-2" onClick={transfer} disabled={loadingTransfer} style={{backgroundColor: '#35FFD4', border: "none"}}>
              {loadingTransfer ? <Spinner size="sm" animation="grow" variant="dark"/>: "Transfer"}
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Item;