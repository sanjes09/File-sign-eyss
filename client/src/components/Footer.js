import React, {useState, useEffect, useContext} from "react";
import { Link } from 'react-router-dom';
import { Web3Context } from "../web3";

export default function Footer() {
  const { account, isOwner} = useContext(Web3Context);
  const [auth, setAuth] = useState(false);
  
  useEffect(() => {
    isOwner().then(resp => {
      setAuth(resp)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account])

  return (
    <div className="m-0 super-center footer">
      {auth && 
        <Link to="/mint-nft" className="platform-button mx-5"  style={{backgroundColor: '#35FFD4', border: "none", color: 'black', textDecoration: 'none', cursor: "pointer", zIndex: 10}}>
          New NFT
        </Link>
      }
    </div>
  );
}
