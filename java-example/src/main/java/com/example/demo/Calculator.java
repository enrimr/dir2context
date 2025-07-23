
package com.example.demo;

/**
 * Una calculadora simple que demuestra funcionalidades básicas.
 * Esta clase contiene métodos para operaciones aritméticas básicas.
 */
public class Calculator {
    private String name;
    private boolean scientific;
    
    /**
     * Constructor por defecto.
     */
    public Calculator() {
        this.name = "Basic Calculator";
        this.scientific = false;
    }
    
    /**
     * Constructor con parámetros.
     * 
     * @param name Nombre de la calculadora
     * @param scientific Si es científica o no
     */
    public Calculator(String name, boolean scientific) {
        this.name = name;
        this.scientific = scientific;
    }
    
    /**
     * Suma dos números.
     * 
     * @param a Primer número
     * @param b Segundo número
     * @return La suma de a y b
     */
    public double add(double a, double b) {
        return a + b;
    }
    
    /**
     * Resta dos números.
     * 
     * @param a Primer número
     * @param b Segundo número
     * @return La diferencia entre a y b
     */
    public double subtract(double a, double b) {
        return a - b;
    }
    
    /**
     * Multiplica dos números.
     * 
     * @param a Primer número
     * @param b Segundo número
     * @return El producto de a y b
     */
    public double multiply(double a, double b) {
        return a * b;
    }
    
    /**
     * Divide dos números.
     * 
     * @param a Numerador
     * @param b Denominador
     * @return El cociente de a y b
     * @throws ArithmeticException si b es cero
     */
    public double divide(double a, double b) {
        if (b == 0) {
            throw new ArithmeticException("División por cero no permitida");
        }
        return a / b;
    }
    
    /**
     * Calcula la potencia de un número.
     * Solo disponible en modo científico.
     * 
     * @param base La base
     * @param exponent El exponente
     * @return base elevado a exponent
     * @throws UnsupportedOperationException si no es una calculadora científica
     */
    public double power(double base, double exponent) {
        if (!scientific) {
            throw new UnsupportedOperationException("Función solo disponible en modo científico");
        }
        return Math.pow(base, exponent);
    }
    
    /**
     * Calcula la raíz cuadrada de un número.
     * Solo disponible en modo científico.
     * 
     * @param number El número
     * @return La raíz cuadrada de number
     * @throws UnsupportedOperationException si no es una calculadora científica
     */
    public double squareRoot(double number) {
        if (!scientific) {
            throw new UnsupportedOperationException("Función solo disponible en modo científico");
        }
        if (number < 0) {
            throw new IllegalArgumentException("No se puede calcular la raíz cuadrada de un número negativo");
        }
        return Math.sqrt(number);
    }
    
    /**
     * Obtiene el nombre de la calculadora.
     * 
     * @return El nombre de la calculadora
     */
    public String getName() {
        return name;
    }
    
    /**
     * Establece el nombre de la calculadora.
     * 
     * @param name El nuevo nombre
     */
    public void setName(String name) {
        this.name = name;
    }
    
    /**
     * Comprueba si la calculadora es científica.
     * 
     * @return true si es científica, false en caso contrario
     */
    public boolean isScientific() {
        return scientific;
    }
    
    /**
     * Establece si la calculadora es científica.
     * 
     * @param scientific El nuevo valor
     */
    public void setScientific(boolean scientific) {
        this.scientific = scientific;
    }
    
    @Override
    public String toString() {
        return name + (scientific ? " (Scientific)" : " (Basic)");
    }
}
