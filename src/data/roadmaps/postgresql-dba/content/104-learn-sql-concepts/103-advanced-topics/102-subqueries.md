# Subqueries

## Subqueries

A subquery is a query that is embedded within another query, often to retrieve intermediate results for further processing by the outer query. Subqueries are an essential part of more complex SQL operations and allow you to perform multiple levels of data manipulation within a single query. 

Subqueries can be used in various parts of an SQL statement, like the SELECT, FROM, WHERE, and HAVING clauses. They can also be classified based on their output or the relationship they represent, such as scalar subqueries, multi-value subqueries, or correlated subqueries. 

### Scalar Subqueries
Scalar subqueries return a single value (one row and one column) that can be directly used in the parent query. They are commonly used in SELECT or WHERE clauses to filter or calculate results based on some criteria.

```sql
SELECT product_id, product_name, price
FROM products
WHERE price > (
    SELECT AVG(price)
    FROM products
);
```

In the above example, the scalar subquery returns the average price of all products, and the outer query returns those products whose price is greater than the average price.

### Multi-Value Subqueries (IN Subqueries)
Multi-value subqueries return a set of values (one column, multiple rows), typically used with the IN operator in the outer query to filter records. These subqueries help when you need to filter data based on a list of values generated by another query.

```sql
SELECT order_id, customer_id
FROM orders
WHERE customer_id IN (
    SELECT customer_id
    FROM customers
    WHERE country = 'USA'
);
```

In this example, the subquery returns a list of customer IDs from the USA, and the outer query fetches orders placed by these customers.

### Correlated Subqueries
Correlated subqueries are a special type of subquery in which the subquery references one or more columns from the outer query. This type of subquery is executed once for each row in the outer query, creating a dependent relationship between the two.

```sql
SELECT c.customer_id, c.customer_name
FROM customers c
WHERE 3 = (
    SELECT COUNT(*)
    FROM orders o
    WHERE o.customer_id = c.customer_id
);
```

In this example, the correlated subquery counts orders for each customer, and the outer query returns customers with exactly 3 orders.

Understanding the use of subqueries and the different types can significantly enhance your ability to express powerful queries in PostgreSQL. Remember that subqueries may affect the performance of your query, so always consider performance optimization techniques and analyze the execution plan when working with complex subqueries.