import React from 'react';
import './flower.css'; 

const GlowingFlower = () => {
  return (
    <div className="night-bg">
      <div className="firefly" style={{ left: '20%', bottom: '20%', animationDelay: '0s' }}></div>
      <div className="firefly" style={{ left: '30%', bottom: '40%', animationDelay: '2.5s' }}></div>
      <div className="firefly" style={{ left: '45%', bottom: '60%', animationDelay: '1.2s' }}></div>
      <div className="firefly" style={{ left: '60%', bottom: '30%', animationDelay: '0.8s' }}></div>
      <div className="firefly" style={{ left: '80%', bottom: '50%', animationDelay: '3s' }}></div>
      <div className="firefly" style={{ left: '50%', bottom: '80%', animationDelay: '4s' }}></div>

      <div className="flower-container">
        {/* Left Flower */}
        <div className="flower flower--left">
          <div className="flower__top">
            <div className="flower__petal"></div>
            <div className="flower__petal"></div>
            <div className="flower__petal"></div>
            <div className="flower__petal"></div>
            <div className="flower__center"></div>
          </div>
          <div className="flower__leaf flower__leaf--1"></div>
          <div className="flower__leaf flower__leaf--2"></div>
          <div className="flower__line"></div>
        </div>

        {/* Center Main Flower */}
        <div className="flower flower--main">
          <div className="flower__top">
            <div className="flower__petal"></div>
            <div className="flower__petal"></div>
            <div className="flower__petal"></div>
            <div className="flower__petal"></div>
            <div className="flower__center"></div>
          </div>
          <div className="flower__leaf flower__leaf--1"></div>
          <div className="flower__leaf flower__leaf--2"></div>
          <div className="flower__leaf flower__leaf--3"></div>
          <div className="flower__leaf flower__leaf--4"></div>
          <div className="flower__line"></div>
        </div>

        {/* Right Flower */}
        <div className="flower flower--right">
          <div className="flower__top">
            <div className="flower__petal"></div>
            <div className="flower__petal"></div>
            <div className="flower__petal"></div>
            <div className="flower__petal"></div>
            <div className="flower__center"></div>
          </div>
          <div className="flower__leaf flower__leaf--1"></div>
          <div className="flower__leaf flower__leaf--2"></div>
          <div className="flower__line"></div>
        </div>
      </div>
    </div>
  );
};
export default GlowingFlower;
