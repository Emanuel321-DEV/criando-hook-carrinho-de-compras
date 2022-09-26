import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    
    // Busca no local Storage um item com o nome @RocketShoes:cart
    const storagedCart = localStorage.getItem("@RocketShoes:cart");

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  // Responsavel por add um produto ao carrinho
  const addProduct = async (productId: number) => {
    try {
      // TODO
      const productIsOnCart = cart.find(product => product.id === productId); // verifica se o produto está no carrinho

      const getStock = await api.get(`/stock/${productId}`); // Busca o estoque de um produto pelo ID
      const stock: Stock = await getStock.data;
      const stockIsInsuficient = productIsOnCart ? stock.amount - (productIsOnCart.amount + 1) < 0 : stock.amount - 1 < 0;

      if (stockIsInsuficient) {
        toast.error("Quantidade solicitada fora de estoque");
        return;
      }
      
      if (productIsOnCart) {
        
        // Percorre cada produto no carrinho, se o ID do produto bater com o ID informado nos parametros da função, então a propriedade amount(quantidade) desse produto terá seu valor incrementado em 1.
        const incrementProductInCart = cart.map(productItem => productItem.id === productId ? {
          ...productItem,
          amount: productItem.amount + 1
        } : productItem)

        // Atualiza o valor do carrinho
        setCart(incrementProductInCart);
        
        // Salva as mudanças feitas no localStorage
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(incrementProductInCart));
        
      } else {
        
        const getProduct = await api.get(`/products/${productId}`); // Busca um produto na api pelo ID
        const product = await getProduct.data;
        
        Object.assign(product, {
          amount: 1
        }); // Adiciona a propriedade amount no produto com valor 1. 

        setCart([...cart, product]); // atualiza o valor do carrinho

        localStorage.setItem("@RocketShoes:cart", JSON.stringify([...cart, product])); // Salva as mudanças feitas no localStorage

      }

    } catch {
      
      toast.error("Erro na adição do produto");

      return;
    }
  };

  // Responsável por remover um produto do carrinho
  const removeProduct = (productId: number) => {
    try {

      const productIsOnCart = cart.some(product => product.id === productId); // Verifica se esse produto de fato está no carrinho.

      if (productIsOnCart === false) {
        throw new Error();
      }

      // Pega os produtos do carrinho e faz um filtro, nesse filtro, só passa os produtos com ID diferente do ID informado nos parametros da rota. Dessa forma, o produto é removido. 
      const cartUpdated = cart.filter(productInCart => productInCart.id !== productId);

      setCart(cartUpdated); // Atualiza o valor do carrinho

      localStorage.setItem("@RocketShoes:cart", JSON.stringify(cartUpdated)); // Salva as mudanças no localStorage

    } catch {
      // TODO
      toast.error("Erro na remoção do produto");
      return;
    }
  };

  // Atualiza o valor de um produto no carrinho.
  const updateProductAmount = async ({
    productId, // ID do produto
    amount,   // Quantidade que JÁ ESTÁ NO CARRINHO +1(Pra incremento) ou -1(Pra decremento).
  }: UpdateProductAmount) => {
    try {

      const productIsOnCart = cart.some(product => product.id === productId); // Verifica se o produto está de fato no carrinho

      if (productIsOnCart === false) {
        throw new Error();
      }

      if (amount < 1) {
        return;
      }

      const findStock = await api.get(`stock/${productId}`); // Busca o estoque de um produto pelo ID
      const stock = findStock.data.amount;
      const stockIsInsuficient = stock - amount < 0;

      if (stockIsInsuficient) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      // Percorre cada produto no carrinho, se o ID do produto bater com o ID informado nos parametros da função, então a propriedade amount(quantidade) desse produto terá seu valor atualizado com o amount presente nos parametros da função.
      const updateProductAmount = cart.map(productItem => (
        productItem.id === productId ? {
        ...productItem,
        amount: amount
      } : productItem));


      setCart(updateProductAmount);
      
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(updateProductAmount));


    } catch {

      toast.error('Erro na alteração de quantidade do produto');

      return;
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
