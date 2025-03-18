import "bootstrap/dist/css/bootstrap.min.css";
import { FaTimes, FaEdit, FaArrowRight, FaPlus, FaMinus } from "react-icons/fa";
import { useState, useEffect } from "react";
import Rodal from "rodal";
import "rodal/lib/rodal.css";
import { useForm, useFieldArray } from "react-hook-form";
import { db } from "./utils/firebase.config";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

interface Product {
  name: string;
  quantity: number;
  price?: number;
}

interface Order {
  id: string;
  description: string;
  products: Product[];
  total?: number;
  status: "create" | "in-progress" | "done";
}

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [current, setCurrent] = useState("");
  const { register, handleSubmit, control, reset } = useForm<Order>({
    defaultValues: {
      description: "",
      products: [],
      status: "create",
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "products",
  });
  useEffect(() => {
    getOrders();
  }, []);

  const getOrders = async () => {
    setIsLoading(true);
    const userCol = collection(db, "orders");
    const res = await getDocs(userCol);
    const OrderArr: Order[] = res.docs.map((item) => ({
      id: item.id,
      ...(item.data() as Omit<Order, "id">),
    }));
    setOrders(OrderArr);
    setIsLoading(false);
  };

  const addProduct = () => {
    append({ name: "", quantity: 1, price: 0 });
  };

  const decreaseQuantity = (index: number) => {
    remove(index);
  };

  const moveOrder = async (id: string, status: string) => {
    const newStatus = status === "create" ? "in-progress" : "done";
    await updateDoc(doc(db, "orders", id), { status: newStatus });
    getOrders();
  };

  const deleteOrder = async (id: string) => {
    await deleteDoc(doc(db, "orders", id));
    getOrders();
  };
  const editOrder = (params: Order) => {
    setModalVisible(true);
    setCurrent(params.id);
    reset(params);
  };
  const onSubmit = async (data: Order) => {
    const datas = {
      total: data.total,
      products: data.products,
      status: data.status,
      description: data.description,
    };
    const updatedProducts = data.products.map((product) => ({
      ...product,
      price: 20_000,
    }));

    const total = updatedProducts.reduce((sum, product) => {
      return sum + product.price * product.quantity;
    }, 0);

    if (current === "") {
      add({ ...data, products: updatedProducts, total });
    } else {
      edit({ ...datas, products: updatedProducts, total });
    }
    reset({
      description: "",
      products: [],
      status: "create",
    });
    setModalVisible(false);
    setCurrent("");
  };
  const edit = async (data) => {
    console.log(data);
    console.log(current);
    const docRef = doc(db, "orders", current);
    await updateDoc(docRef, data);
    getOrders();
  };
  async function add(data: Order) {
    await addDoc(collection(db, "orders"), {
      ...data,
      status: "create",
    });
    getOrders();
  }

  return (
    <div className="container p-4">
      <button
        className="btn btn-primary mb-3"
        onClick={() => setModalVisible(true)}
      >
        Create Order
      </button>
      <Rodal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        width={400}
        height={500}
      >
        <h4>Create Order</h4>
        <form onSubmit={handleSubmit(onSubmit)}>
          <textarea
            {...register("description")}
            placeholder="Description"
            className="form-control mb-2 mt-5"
          ></textarea>
          <div>
            <label>Products:</label>
            <div style={{ maxHeight: "200px", overflow: "auto" }}>
              {fields.map((product, index) => (
                <div
                  key={product.id}
                  className="d-flex align-items-center mb-2"
                >
                  <select
                    {...register(`products.${index}.name`)}
                    className="form-select me-2"
                  >
                    <option value="">Select product</option>
                    <option value="Olma">Olma</option>
                    <option value="Anor">Anor</option>
                  </select>
                  <input
                    type="number"
                    min="1"
                    className="form-control me-2"
                    {...register(`products.${index}.quantity`)}
                  />
                  <button
                    className="btn btn-danger"
                    type="button"
                    onClick={() => decreaseQuantity(index)}
                  >
                    <FaMinus />
                  </button>
                </div>
              ))}
            </div>
            <button
              className="btn btn-success"
              type="button"
              onClick={addProduct}
            >
              <FaPlus />
            </button>
          </div>
          <button type="submit" className="btn btn-primary mt-3">
            Submit Order
          </button>
        </form>
      </Rodal>

      {isLoading ? (
        <div className="d-flex justify-content-center gap-2">
          <button
            className="btn btn-primary d-flex justify-content-center align-items-center"
            type="button"
            disabled
          >
            <span
              className="spinner-border spinner-border-sm m-1"
              role="status"
              aria-hidden="true"
            ></span>
            <span className="m-1">Loading...</span>
          </button>
        </div>
      ) : (
        <div className="row">
          <div className="col-md-4">
            <h4 className="text-center">Create</h4>
            <div
              style={{ maxHeight: "350px", overflow: "auto" }}
              className="order-section bg-light p-3 rounded"
            >
              {orders
                .filter((order) => order.status === "create")
                .map((order, index) => (
                  <div
                    key={index}
                    className="order-item p-2 mb-2 bg-white rounded border"
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5>Order #{index + 1}</h5>
                        <h5>Desc: {order.description}</h5>
                      </div>
                      <div>
                        <FaTimes
                          className="text-danger me-2"
                          onClick={() => deleteOrder(order.id)}
                        />
                        <FaArrowRight
                          className="text-primary"
                          onClick={() => moveOrder(order.id, order.status)}
                        />
                        <button
                          className="btn btn-warning"
                          onClick={() => editOrder(order)}
                        >
                          <FaEdit /> Edit
                        </button>
                      </div>
                    </div>
                    <ul className="list-group mb-2">
                      {order.products.map((product, i) => (
                        <li
                          key={i}
                          className="list-group-item d-flex justify-content-between"
                        >
                          {product.name}
                          <span>
                            {product.quantity} x{" "}
                            {product.price?.toLocaleString()} UZS
                          </span>
                        </li>
                      ))}
                    </ul>
                    <strong>Total: {order.total?.toLocaleString()} UZS</strong>
                  </div>
                ))}
            </div>
          </div>

          <div className="col-md-4">
            <h4 className="text-center">In Progress</h4>
            <div
              style={{ maxHeight: "350px", overflow: "auto" }}
              className="order-section bg-light p-3 rounded"
            >
              {orders
                .filter((order) => order.status === "in-progress")
                .map((order, index) => (
                  <div
                    key={index}
                    className="order-item p-2 mb-2 bg-white rounded border"
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5>Order #{index + 1}</h5>
                        <h5>Desc: {order.description}</h5>
                      </div>
                      <div>
                        <FaTimes
                          className="text-danger me-2"
                          onClick={() => deleteOrder(order.id)}
                        />

                        <FaArrowRight
                          className="text-primary"
                          onClick={() => moveOrder(order.id, order.status)}
                        />

                        <button
                          className="btn btn-warning"
                          onClick={() => editOrder(order)}
                        >
                          <FaEdit /> Edit
                        </button>
                      </div>
                    </div>
                    <ul className="list-group mb-2">
                      {order.products.map((product, i) => (
                        <li
                          key={i}
                          className="list-group-item d-flex justify-content-between"
                        >
                          {product.name}
                          <span>
                            {product.quantity} x
                            {product.price?.toLocaleString()} UZS
                          </span>
                        </li>
                      ))}
                    </ul>
                    <strong>Total: {order.total?.toLocaleString()} UZS</strong>
                  </div>
                ))}
            </div>
          </div>
          <div className="col-md-4">
            <h4 className="text-center">Done</h4>
            <div
              style={{ maxHeight: "350px", overflow: "auto" }}
              className="order-section bg-light p-3 rounded"
            >
              {orders
                .filter((order) => order.status === "done")
                .map((order, index) => (
                  <div
                    key={index}
                    className="order-item p-2 mb-2 bg-white rounded border"
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5>Order #{index + 1}</h5>
                        <h5>Desc: {order.description}</h5>
                      </div>
                      <div>
                        <FaTimes
                          className="text-danger me-2"
                          onClick={() => deleteOrder(order.id)}
                        />
                        <button
                          className="btn btn-warning"
                          onClick={() => editOrder(order)}
                        >
                          <FaEdit /> Edit
                        </button>
                      </div>
                    </div>
                    <ul className="list-group mb-2">
                      {order.products.map((product, i) => (
                        <li
                          key={i}
                          className="list-group-item d-flex justify-content-between"
                        >
                          {product.name}
                          <span>
                            {product.quantity} x{" "}
                            {product.price?.toLocaleString()} UZS
                          </span>
                        </li>
                      ))}
                    </ul>
                    <strong>Total: {order.total?.toLocaleString()} UZS</strong>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
