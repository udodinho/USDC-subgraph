import { SelfSufficientERC20 } from "../generated/SelfSufficientERC20/SelfSufficientERC20" //import entities
import { Balance, Token, User } from "../generated/schema";
import { BigDecimal, ethereum, Address } from "@graphprotocol/graph-ts";


export function createOrLoadUser( id: string ): User {
    let user = User.load(id);
    if (user == null) {
        user = new User(id);
        user.save();
    }
    return user;
}

export function fetchTokenDetails(event: ethereum.Event): Token | null {
  let token = Token.load(event.address.toHex());
  if (!token) {
    token = new Token(event.address.toHex());

    token.name = "N/A";
    token.symbol = "N/A";
    token.decimals = BigDecimal.fromString("0");

    let erc20 = SelfSufficientERC20.bind(event.address);

    let tokenName = erc20.try_name();
    if (!tokenName.reverted) {
      token.name = tokenName.value;
    }

    let tokenSymbol = erc20.try_symbol();
    if (!tokenSymbol.reverted) {
      token.symbol = tokenSymbol.value;
    }

    let tokenDecimal = erc20.try_decimals();
    if (!tokenDecimal.reverted) {
      token.decimals = BigDecimal.fromString(tokenDecimal.value.toString());
    }

    token.save();
  }
  return token;
}

export function fetchBalance(
  tokenAddress: Address,
  accountAddress: Address
): BigDecimal {
  let erc20 = SelfSufficientERC20.bind(tokenAddress);
  let amount = BigDecimal.fromString("0");
  let balance = erc20.try_balanceOf(accountAddress);
  if (!balance.reverted) {
    amount = balance.value.toBigDecimal();
  }
  return amount;
}
