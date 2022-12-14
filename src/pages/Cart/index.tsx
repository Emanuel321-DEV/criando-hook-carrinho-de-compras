import React from 'react';
import {
  MdDelete,
  MdAddCircleOutline,
  MdRemoveCircleOutline,
} from 'react-icons/md';

import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../util/format';
import { Container, ProductTable, Total } from './styles';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
}

const Cart = (): JSX.Element => {
   const { cart, removeProduct, updateProductAmount } = useCart();

   // Percorre cada produto no carrinho, adicionando as propriedades 'preço formatado' e subtotal(Preço x Quantidade desse produto) 
   const cartFormatted = cart.map(product => ({
      ...product,
      priceFormatted: formatPrice(product.price),
      subtotal: formatPrice(product.price * product.amount)
   }));

   // Percorre todos os produtos do carrinho, e no fim das contas devolve o valor total (Todos os preços somados)
   const total =
     formatPrice(
       cart.reduce((sumTotal, product) => {
          return sumTotal + product.price * product.amount;
       }, 0)
     );

  // Incrementa um produto no carrinho
  function handleProductIncrement(product: Product) {

    const productId = product.id;

    updateProductAmount({ productId, amount: product.amount + 1 });
  }

  // Decrementa um produto no carrinho
  function handleProductDecrement(product: Product) {

    const productId = product.id;

    updateProductAmount({ productId, amount: product.amount - 1 });

  }

  // Remove um produto do carrinho
  function handleRemoveProduct(productId: number) {
    removeProduct(productId);
  }

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th aria-label="product image" />
            <th>PRODUTO</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label="delete icon" />
          </tr>
        </thead>
        <tbody>
          {cartFormatted.map(product => (
                      <tr key={product.id} data-testid="product">
                      <td>
                        <img src={product.image} alt={product.title}/>
                      </td>
                      <td>
                        <strong>{product.title}</strong>
                        <span>{product.priceFormatted}</span>
                      </td>
                      <td>
                        <div>
                          <button
                            type="button"
                            data-testid="decrement-product"
                            disabled={product.amount <= 1}
                            onClick={() => handleProductDecrement(product)}
                          >
                            <MdRemoveCircleOutline size={20} />
                          </button>
                          <input
                            type="text"
                            data-testid="product-amount"
                            readOnly
                            value={product.amount}
                          />
                          <button
                            type="button"
                            data-testid="increment-product"
                            onClick={() => handleProductIncrement(product)}
                          >
                            <MdAddCircleOutline size={20} />
                          </button>
                        </div>
                      </td>
                      <td>
                        <strong>{product.subtotal}</strong>
                      </td>
                      <td>
                        <button
                          type="button"
                          data-testid="remove-product"
                          onClick={() => handleRemoveProduct(product.id)}
                        >
                          <MdDelete size={20} />
                        </button>
                      </td>
                    </tr>
          ))}

        </tbody>
      </ProductTable>

      <footer>
        <button type="button">Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong>{total}</strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;
