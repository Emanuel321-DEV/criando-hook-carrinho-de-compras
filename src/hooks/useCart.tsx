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
     const storagedCart = localStorage.getItem("@RocketShoes:cart")

     if (storagedCart) {
       return JSON.parse(storagedCart);
     }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      // TODO
      const findProductInCart = cart.find(product => product.id === productId);

      const getProduct = await api.get(`products/${productId}`);
      const product = await getProduct.data;

      
      const findStock = await api.get(`/stock/${productId}`);
      const stock = await findStock.data.amount;

      const stockIsInsuficient = findProductInCart ? stock - (findProductInCart.amount + 1) < 0 : stock.amount - 1 < 0; // Erro aqui

      if(stockIsInsuficient){

        toast.error("Quantidade solicitada fora de estoque");
        return;
      }
      
      const productAlreadyExistsInCart = cart.some(product => product.id === productId);

      Object.assign(product, {
        amount: 1
      })

      if(productAlreadyExistsInCart){

        const incrementProductInCart = cart.map(productItem => productItem.id === productId ? {
          ...productItem,
          amount: productItem.amount + 1
        }: productItem)

        setCart(incrementProductInCart);

        localStorage.setItem("@RocketShoes:cart", JSON.stringify(incrementProductInCart));

      } else {
        setCart([...cart, product])
        localStorage.setItem("@RocketShoes:cart", JSON.stringify([...cart, product]))
      }


    } catch {
      // TODO
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
      const productIsOnCart = cart.some(product => product.id === productId); 


      if(productIsOnCart === false){
        throw new Error();
      }

      const cartUpdated = cart.filter(productInCart => productInCart.id !== productId);

      setCart(cartUpdated);

      localStorage.setItem("@RocketShoes:cart", JSON.stringify(cartUpdated));

    } catch {
      // TODO
      toast.error("Erro na remoção do produto");
    }
  };
  
  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      
      const findProductInCart = cart.find(product => product.id === productId);
      
      if(!findProductInCart){
        throw Error();
      }

      // TODO 
       if(amount < 1){
        return;
      } 

      const findStock = await api.get(`stock/${productId}`)
      const stock = findStock.data.amount;
      const stockIsInsuficient = stock - amount < 0;
      
      if(stockIsInsuficient){
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      // Produto que n existe ou nao existe no carrinho ??


      const updateProductAmount = cart.map(productItem => { 
        console.log("ESTE EH AMOUNT", amount);
        return productItem.id === productId ? {
        ...productItem,
        amount,
      } : productItem})

      setCart(updateProductAmount);
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(updateProductAmount))

    } catch {
      // TODO
      toast.error('Erro na alteração de quantidade do produto')
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
