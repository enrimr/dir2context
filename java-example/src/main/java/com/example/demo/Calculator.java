
package com.example.demo;

/**
 * Una calculadora simple que demuestra funcionalidades b�sicas.
 * Esta clase contiene m�todos para operaciones aritm�ticas b�sicas.
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
     * Constructor con par�metros.
     * 
     * @param name Nombre de la calculadora
     * @param scientific Si es cient�fica o no
     */
    public Calculator(String name, boolean scientific) {
        this.name = name;
        this.scientific = scientific;
    }
    
    /**
     * Suma dos n�meros.
     * 
     * @param a Primer n�mero
     * @param b Segundo n�mero
     * @return La suma de a y b
     */
    public double add(double a, double b) {
        return a + b;
    }
    
    /**
     * Resta dos n�meros.
     * 
     * @param a Primer n�mero
     * @param b Segundo n�mero
     * @return La diferencia entre a y b
     */
    public double subtract(double a, double b) {
        return a - b;
    }
    
    /**
     * Multiplica dos n�meros.
     * 
     * @param a Primer n�mero
     * @param b Segundo n�mero
     * @return El producto de a y b
     */
    public double multiply(double a, double b) {
        return a * b;
    }
    
    /**
     * Divide dos n�meros.
     * 
     * @param a Numerador
     * @param b Denominador
     * @return El cociente de a y b
     * @throws ArithmeticException si b es cero
     */
    public double divide(double a, double b) {
        if (b == 0) {
            throw new ArithmeticException("Divisi�n por cero no permitida");
        }
        return a / b;
    }
    
    /**
     * Calcula la potencia de un n�mero.
     * Solo disponible en modo cient�fico.
     * 
     * @param base La base
     * @param exponent El exponente
     * @return base elevado a exponent
     * @throws UnsupportedOperationException si no es una calculadora cient�fica
     */
    public double power(double base, double exponent) {
        if (!scientific) {
            throw new UnsupportedOperationException("Funci�n solo disponible en modo cient�fico");
        }
        return Math.pow(base, exponent);
    }
    
    /**
     * Calcula la ra�z cuadrada de un n�mero.
     * Solo disponible en modo cient�fico.
     * 
     * @param number El n�mero
     * @return La ra�z cuadrada de number
     * @throws UnsupportedOperationException si no es una calculadora cient�fica
     */
    public double squareRoot(double number) {
        if (!scientific) {
            throw new UnsupportedOperationException("Funci�n solo disponible en modo cient�fico");
        }
        if (number < 0) {
            throw new IllegalArgumentException("No se puede calcular la ra�z cuadrada de un n�mero negativo");
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
     * Comprueba si la calculadora es cient�fica.
     * 
     * @return true si es cient�fica, false en caso contrario
     */
    public boolean isScientific() {
        return scientific;
    }
    
    /**
     * Establece si la calculadora es cient�fica.
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
