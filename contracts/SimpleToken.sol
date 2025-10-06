// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SimpleToken
 * @dev ERC20 代币合约，支持铸造和销毁功能
 * @author DApp Team
 */
contract SimpleToken is ERC20, Ownable {
    // 事件定义
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);
    
    /**
     * @dev 构造函数
     * @param name 代币名称
     * @param symbol 代币符号
     * @param initialSupply 初始供应量（不包含小数位）
     */
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable(msg.sender) {
        // 铸造初始供应量给合约部署者
        _mint(msg.sender, initialSupply * 10**decimals());
    }
    
    /**
     * @dev 铸造新代币（仅所有者可调用）
     * @param to 接收代币的地址
     * @param amount 铸造数量（包含小数位）
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "SimpleToken: mint to zero address");
        require(amount > 0, "SimpleToken: mint amount must be greater than 0");
        
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
    
    /**
     * @dev 销毁代币（任何人都可以销毁自己的代币）
     * @param amount 销毁数量（包含小数位）
     */
    function burn(uint256 amount) external {
        require(amount > 0, "SimpleToken: burn amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "SimpleToken: burn amount exceeds balance");
        
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }
    
    /**
     * @dev 从指定地址销毁代币（需要授权）
     * @param from 销毁代币的地址
     * @param amount 销毁数量（包含小数位）
     */
    function burnFrom(address from, uint256 amount) external {
        require(from != address(0), "SimpleToken: burn from zero address");
        require(amount > 0, "SimpleToken: burn amount must be greater than 0");
        
        uint256 currentAllowance = allowance(from, msg.sender);
        require(currentAllowance >= amount, "SimpleToken: burn amount exceeds allowance");
        
        _spendAllowance(from, msg.sender, amount);
        _burn(from, amount);
        emit TokensBurned(from, amount);
    }
    
    /**
     * @dev 获取合约信息
     * @return name_ 代币名称
     * @return symbol_ 代币符号
     * @return decimals_ 小数位数
     * @return totalSupply_ 总供应量
     * @return owner_ 合约所有者
     */
    function getContractInfo() external view returns (
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 totalSupply_,
        address owner_
    ) {
        return (
            name(),
            symbol(),
            decimals(),
            totalSupply(),
            owner()
        );
    }
}