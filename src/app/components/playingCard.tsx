import { useState } from "react";
import { Card } from "../lib/cards";
import "../styles/playingCard.css"

export function PlayingCard(card: Card){
  const [show, setShow] = useState<Boolean>(false)

  function getColour(){
    if(card.suit === "♦️" || card.suit === "♥️"){
      return "#FF0000"
    } else {
      return "#000"
    }
  }

  function getValue(){
    switch(card.value) {
      case 14: {
        return "A"
        }
      case 13: {
        return "K"
      }
      case 12: {
        return "Q"
      }
      case 11: {
        return "J"
      }
      default: {
        return card.value
      }
    }
  }

  function turnCard(){
    setShow(!show)
  }
  return (
    <div className="card-wrapper" style={{ color: getColour()}} onClick={turnCard}>
      <div className="card-back"></div>
      <div className="card-face">
      <div className="card-value">
        <div>{getValue()}</div>
        <div>{card.suit}</div>
      </div>
      <div className="card-suit">{card.suit}</div></div>
    </div>
  )
}
