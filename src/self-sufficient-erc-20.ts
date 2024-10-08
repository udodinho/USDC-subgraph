import { BigDecimal, BigInt } from "@graphprotocol/graph-ts"
import {
  SelfSufficientERC20,
  Approval,
  Transfer
} from "../generated/SelfSufficientERC20/SelfSufficientERC20"
import { Balance } from "../generated/schema"
import { createOrLoadUser, fetchBalance, fetchTokenDetails } from "./utils"

export function handleApproval(event: Approval): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  // let entity = ExampleEntity.load(event.transaction.from)

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  // if (!entity) {
  //   // entity = new ExampleEntity(event.transaction.from)

  //   // Entity fields can be set using simple assignments
  //   entity.count = BigInt.fromI32(0)
  // }

  // // BigInt and BigDecimal math are supported
  // entity.count = entity.count + BigInt.fromI32(1)

  // // Entity fields can be set based on event parameters
  // entity.owner = event.params.owner
  // entity.spender = event.params.spender

  // // Entities can be written to the store with `.save()`
  // entity.save()

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.allowance(...)
  // - contract.approve(...)
  // - contract.balanceOf(...)
  // - contract.decimals(...)
  // - contract.decreaseAllowance(...)
  // - contract.increaseAllowance(...)
  // - contract.name(...)
  // - contract.symbol(...)
  // - contract.totalSupply(...)
  // - contract.transfer(...)
  // - contract.transferFrom(...)
}

export function handleTransfer(event: Transfer): void {
  let sender = createOrLoadUser(event.params.from.toHexString()) 
  
  let user = createOrLoadUser(event.params.to.toHexString());

  let token = fetchTokenDetails(event);

    if (!token) return

    if (!sender || !user) return;

    //setting the token balance of the 'from' account
    let fromTokenBalance = Balance.load(token.id + "-" + sender.id);
    if (!fromTokenBalance) { 
          fromTokenBalance = new Balance(token.id + "-" + sender.id);
          fromTokenBalance.token = token.id;
          fromTokenBalance.owner = sender.id;
    }

    fromTokenBalance.amount = fetchBalance(event.address, event.params.from)

		//filtering out zero-balance tokens - optional
    if(fromTokenBalance.amount != BigDecimal.fromString("0")){
      fromTokenBalance.save();
    }
    
    //setting the token balance of the 'to' account
    let toTokenBalance = Balance.load(token.id + "-" + user.id);

    if (!toTokenBalance) {
        toTokenBalance = new Balance(token.id + "-" + user.id);
        toTokenBalance.token = token.id;
        toTokenBalance.owner = user.id;
      }

    toTokenBalance.amount = fetchBalance(event.address, event.params.to)
    if(toTokenBalance.amount != BigDecimal.fromString("0")){
      toTokenBalance.save();
    }
}
